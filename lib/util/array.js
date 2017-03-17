import { Cache } from './cache';
import { parseDate } from './date';
import {
  defaultOrdering,
  identity,
  leqToNumericOrdering,
  lexicalCompose,
  mapArguments,
} from './function';

/**
 * Perform a "splice" operation and return a new array without mutating the original
 * @param {Array} array - the original array to splice
 * @returns {Array} - a new array spliced from the original
 */
export function immutableSplice(array, ...args) {
  array = array.slice();
  array.splice(...args);
  return array;
}

/**
 * Remove an item by index and return the resulting array without mutating the original
 * @param {Array} array - the original array to remove an item from
 * @param {number} index - the index of the item to remove
 * @returns {Array} - a new array that is a copy of the original with an item removed
 */
export function removeByIndex(array, index) {
  if (index >= array.length || index < -array.length) {
    throw `IndexError: array index out of range`;
  }
  return immutableSplice(array, index, 1);
}

/**
 * Remove an item by value and return the resulting array without mutating the original
 * @param {Array} array - the original array to remove an item from
 * @param {*} value - the value to remove
 * @returns {Array} - a new array that is a copy of the original with an item removed
 */
export function removeByValue(array, value) {
  let index = array.indexOf(value);
  if (index === -1) {
    throw `ValueError: ${value} is not in array`;
  }
  return removeByIndex(array, index);
}

/**
 * Replace an item by index and return the resulting array without mutating the original
 * @param {Array} array - the original array to replace an item from
 * @param {number} index - the index of the item to replace
 * @param {*} value - the value to replace the item with
 * @returns {Array} - a new array that is a copy of the original with an item replaced
 */
export function replaceByIndex(array, index, value) {
  if (index >= array.length || index < -array.length) {
    throw `IndexError: array index out of range`;
  }
  return immutableSplice(array, index, 1, value);
}

/**
 * Insert an item at an index and return the resulting array without mutating the original
 * @param {Array} array - the original array to insert an item into
 * @param {number} index - the index to insert the new item at
 * @param {*} value - the value of the new item
 * @returns {Array} - a new array that is a copy of the original with the value inserted
 */
export function insertAtIndex(array, index, value) {
  if (index > array.length || index < -array.length) {
    throw `IndexError: array index out of range`;
  }
  return immutableSplice(array, index, 0, value);
}

// ensure null items (used to designate invalid items) are placed last in the sorted order
const NULL_ORDERING = leqToNumericOrdering((a, b) => a !== null || b === null);
const SORT_ORDERING = {
  asc: lexicalCompose(NULL_ORDERING, (a, b) => defaultOrdering(a, b)),
  desc: lexicalCompose(NULL_ORDERING, (a, b) => defaultOrdering(b, a)),
};

/**
 * Construct a sort comparator function that orders items by numeric value, comparing them via a <= operation.
 * null items are placed last in the sorted order.
 * @param {string} [order=`asc`] - `asc` (default) sorts ascending; `desc` sorts descending
 * @param {Function} [transform=identity] - a function that can transform each item before comparison (defaults to identity: x => x)
 * @returns {Function} - a sort comparator func that can be passed to Array.sort (for any given a and b returns one of [1, 0, -1])
 * @example
 * <<< [1, 2, 3, 4, 5].sort(baseComparator({order: `desc`, transform: n => n % 2}));
 * >>> [2, 4, 1, 3, 5] // sorted by even numbers followed by odd numbers
 */
export function baseComparator({
  order=`asc`,
  transform=identity,
}={}) {
  return mapArguments(SORT_ORDERING[order], transform);
}

/**
 * Construct a sort comparator function that orders date strings by parsed date value, converting them to integer timestamps and
 * then comparing via a <= operation. Invalid date strings are placed last in the sorted order.
 * @param {string} [order=`asc`] - `asc` (default) sorts ascending; `desc` sorts descending
 * @param {Function} [transform=identity] - a function that can transform each item before comparison (defaults to identity: x => x)
 * @param {Cache} [parseDateCache] - a Cache instance used to store date strings <-> timestamps to avoid redundant parsing
 * @param {object} [parseDateConfig] - a config object that provides fine-grained control over how date strings are parsed (see parseDate)
 * @param {string|RegExp} [dateRegex] - a regex that can be used to only try and parse certain strings as dates (for performance)
 * @returns {Function} - a sort comparator func that can be passed to Array.sort (for any given a and b returns one of [1, 0, -1])
 * @example
 * <<< [`12~1`, `blarg`, `12~2`].sort(baseComparator({order: `desc`, transform: dateString => dateString.replace(`~`, ` `)}));
 * >>> [`12~2`, `12~1`, `blarg`] // sorted by parseable date value
 *
 * If you want to cache parsed date values across multiple sorts for performance, initialize your own parseDateCache externally
 * and pass in that single instance:
 *
 *   const parseDateCache = new Cache();
 * ... later, within your sorting code ...
 *   array.sort(dateStringComparator({parseDateCache}));
 */
export function dateStringComparator({
  order=`asc`,
  transform=identity,
  parseDateCache=null,
  parseDateConfig={},
  dateRegex=null,
}={}) {
  parseDateCache = parseDateCache || new Cache();
  dateRegex = dateRegex && new RegExp(dateRegex);

  return mapArguments(SORT_ORDERING[order], item => {
    item = transform(item);
    return parseDateCache.fetch(item, item => {
      let timestamp = null;
      if (!dateRegex || dateRegex.test(item)) {
        const date = parseDate(item, parseDateConfig);
        timestamp = date && date.getTime();
      }
      return timestamp;
    });
  });
}

/**
 * Construct a sort comparator function that orders numeric strings by parsed numeric value, converting them to Numbers and
 * then comparing via a <= operation. Invalid numeric strings are placed last in the sorted order.
 * @param {string} [order=`asc`] - `asc` (default) sorts ascending; `desc` sorts descending
 * @param {Function} [transform=identity] - a function that can transform each item before comparison (defaults to identity: x => x)
 * @param {Cache} [parseNumberCache] - a Cache instance used to store number-like values <-> numbers to avoid redundant parsing
 * @returns {Function} - a sort comparator func that can be passed to Array.sort (for any given a and b returns one of [1, 0, -1])
 * @example
 * <<< [`n:-9,000`, `n:blarg`, `n:42`].sort(baseComparator({order: `desc`, transform: numericString => numericString.split(:)[1]}));
 * >>> [`n:42`, `n:-9,000`, `n:blarg`] // sorted by parseable numeric value
 *
 * If you want to cache parsed number values across multiple sorts for performance, initialize your own parseNumberCache externally
 * and pass in that single instance:
 *
 *   const parseNumberCache = new Cache();
 * ... later, within your sorting code ...
 *   array.sort(dateStringComparator({parseNumberCache}));
 */
export function numericComparator({
  order=`asc`,
  transform=identity,
  parseNumberCache=null,
}={}) {
  parseNumberCache = parseNumberCache || new Cache();

  return mapArguments(SORT_ORDERING[order], item => {
    item = transform(item);

    return parseNumberCache.fetch(item, item => {
      const number = Number(item && item.replace ? item.replace(/,/g, ``) : item);
      return !isNaN(number) ? number : null;
    });
  });
}

/**
 * Construct a sort comparator function that orders strings by parsed date, numeric, or alphabetic value.
 * @param {string|object} [order=`asc`] - `asc`/`desc` order string. Can also be an object like {base: `asc`, number: `desc`, date: `desc`} for finer-grained control over sub-comparators
 * @param {Function} [transform=identity] - a function that can transform each item before comparison (defaults to identity: x => x)
 * @param {Cache} [parseNumberCache] - a Cache instance used to store number-like values <-> numbers to avoid redundant parsing
 * @param {Cache} [parseDateCache] - a Cache instance used to store date strings <-> timestamps to avoid redundant parsing
 * @param {object} [parseDateConfig] - a config object that provides fine-grained control over how date strings are parsed (see parseDate)
 * @param {string|RegExp} [dateRegex] - a regex that can be used to only try and parse certain strings as dates (for performance)
 * @returns {Function} - a sort comparator func that can be passed to Array.sort (for any given a and b returns one of [1, 0, -1])
 * @example
 * <<< [`12/1`, `blarg`, `-9,000`, `12/2`, `42`].sort(baseComparator({order: `desc`}));
 * >>> [`42`, `-9,000`, `12/2`, `12/1`, `blarg`]
 */
export function numDateAlphaComparator({
  order=`asc`,
  transform=identity,
  parseNumberCache=null,
  parseDateCache=null,
  parseDateConfig={},
  dateRegex=null,
}={}) {
  if (order === `asc` || order === `desc`) {
    order = {
      number: order,
      date: order,
      base: order,
    };
  } else {
    order = {
      number: order && order.number || `asc`,
      date: order && order.date || `asc`,
      base: order && order.base || `asc`,
    };
  }
  return lexicalCompose(
    numericComparator({order: order.number, transform, parseNumberCache}),
    dateStringComparator({order: order.date, transform, parseDateCache, parseDateConfig, dateRegex}),
    baseComparator({order: order.base, transform})
  );
}

/**
 * Sort array without mutating original
 * @param {Array} arr - array to sort
 * @param {string} [order='asc'] - sort order ('asc' or 'desc')
 * @param {function} [transform=null] - transforms each element before comparison
 * @example
 * sorted(['XX', 'A', 'g'], {transform: s => s.toLowerCase()});
 * // ['A', 'g', 'XX']
 */
export function sorted(arr, {order=`asc`, transform=identity}={}) {
  return arr.slice().sort(baseComparator({order, transform}));
}

/**
 * Return a copy of an array with duplicate items removed
 * @param {Array} arr - array to de-duplicate
 * @param {function} [options.hash] - hashes each element for comparison
 * Items are compared via strict equality so duplicate arrays/objects will not be removed
 * unless a `hash` function is specified to hash objects before comparison.
 * @example
 * unique([{'a': 1, 'b': 2}, {'a': 1, 'b': 3}, {'a': 1, 'b': 2}], {hash: o => `${o['a']}:${o['b']}`});
 * // [{'a': 1, 'b': 2}, {'a': 1, 'b': 3}]
 */
export function unique(arr, options={}) {
  let hashed;
  const encountered = new Set();
  return arr.filter(item => {
    hashed = options.hash ? options.hash(item) : item;
    return encountered.has(hashed) ? false : encountered.add(hashed);
  });
}
