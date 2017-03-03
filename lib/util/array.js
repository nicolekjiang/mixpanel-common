import { parseDate } from './date';
import {
  defaultOrdering,
  identity,
  leqToNumericOrdering,
  lexicalCompose,
  mapArguments,
} from './function';

export function immutableSplice(array, ...args) {
  let copy = array.slice(0);
  copy.splice(...args);
  return copy;
}

export function removeByIndex(array, index) {
  if (index >= array.length || index < -array.length) {
    throw `IndexError: array index out of range`;
  }
  return immutableSplice(array, index, 1);
}

export function removeByValue(array, value) {
  let index = array.indexOf(value);
  if (index === -1) {
    throw `ValueError: ${value} is not in array`;
  }
  return removeByIndex(array, index);
}

export function replaceByIndex(array, index, value) {
  if (index >= array.length || index < -array.length) {
    throw `IndexError: array index out of range`;
  }
  return immutableSplice(array, index, 1, value);
}

export function insertAtIndex(array, index, value) {
  if (index > array.length || index < -array.length) {
    throw `IndexError: array index out of range`;
  }
  return immutableSplice(array, index, 0, value);
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
export function sorted(arr, {order=`asc`, transform=null}={}) {
  return arr.slice().sort((a, b) => {
    if (transform) {
      a = transform(a);
      b = transform(b);
    }
    let cmp = a > b ? 1 : a < b ? -1 : 0;
    return order === `desc` ? -1 * cmp : cmp;
  });
}

const ORDERING = {
  asc: defaultOrdering,
  desc: leqToNumericOrdering((a, b) => b <= a),
};

export function stringComparator({order=`asc`, transform=identity}={}) {
  return mapArguments(ORDERING[order], transform);
}

export function dateStringComparator({order=`asc`, transform=identity, dateRegex=null, parseDateConfig={}}={}) {
  return mapArguments(ORDERING[order], item => {
    item = transform(item);
    const date = (!dateRegex || new RegExp(dateRegex).test(item)) && parseDate(item, parseDateConfig);
    return date ? date.getTime() : (order === `desc` ? 0 : Infinity); // place non-valid items last
  });
}

export function numericComparator({order=`asc`, transform=identity}={}) {
  return mapArguments(ORDERING[order], item => {
    item = transform(item);
    const number = Number(item.replace ? item.replace(/,/g, ``) : item);
    return !isNaN(number) ? number : (order === `desc` ? 0 : Infinity); // place non-valid items last
  });
}

export function numDateAlphaComparator({order=`asc`, transform=identity, dateRegex=null, parseDateConfig={}}={}) {
  return lexicalCompose(
    numericComparator({order, transform}),
    dateStringComparator({order, transform, dateRegex, parseDateConfig}),
    stringComparator({order, transform})
  );
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
