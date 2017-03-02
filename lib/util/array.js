import { parseDate } from '../../lib/util/date';

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
 * @param {boolean} [lowercase=false] - converts strings to lowercase before comparison
 * @param {boolean} [orderNumDateAlpha=false] - converts numeric and date strings to integers before comparison
 * @param {string|RegExp} [dateRegex=null] - pattern used to determine wether a given string is a date without first parsing it (perf concern)
 * @param {Object} [parseDateConfig={}] - config used for parsing dates when orderNumDateAlpha is true
 * @example
 * sorted(['XX', 'A', 'g'], {transform: s => s.toLowerCase()});
 * // ['A', 'g', 'XX']
 */
export function sorted(arr, {order=`asc`, transform=null, lowercase=false, orderNumDateAlpha=false, dateRegex=null, parseDateConfig={}}={}) {
  dateRegex = dateRegex && new RegExp(dateRegex);

  return arr.slice().sort((a, b) => {
    if (transform) {
      a = transform(a);
      b = transform(b);
    }

    if (lowercase) {
      a = a.toLowerCase ? a.toLowerCase() : a;
      b = b.toLowerCase ? b.toLowerCase() : b;
    }

    if (orderNumDateAlpha) {
      const aNumber = Number(a.replace ? a.replace(/,/g, ``) : a);
      const bNumber = Number(b.replace ? b.replace(/,/g, ``) : b);

      if (!isNaN(aNumber) && !isNaN(bNumber)) {
        a = aNumber;
        b = bNumber;
      } else if (!dateRegex || (dateRegex.test(a) && dateRegex.test(b))) {
        const aDate = parseDate(a, parseDateConfig);
        const bDate = parseDate(b, parseDateConfig);

        if (aDate && bDate) {
          a = aDate.getTime();
          b = bDate.getTime();
        }
      }
    }

    let cmp = a > b ? 1 : a < b ? -1 : 0;
    return order === `desc` ? -1 * cmp : cmp;
  });
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
