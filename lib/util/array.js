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
 * @param {Object} options - sorting configuration
 * @param {string} [options.order='asc'] - sort order ('asc' or 'desc')
 * @param {function} [options.transform] - transforms each element for comparison
 * when sorting
 * @example
 * sorted(['XX', 'A', 'g'], {transform: s => s.toLowerCase()});
 * // ['A', 'g', 'XX']
 */
export function sorted(arr, options={}) {
  options.order = options.order || `asc`;
  return arr.slice().sort((a, b) => {
    if (options.transform) {
      a = options.transform(a);
      b = options.transform(b);
    }
    let cmp = a > b ? 1 : a < b ? -1 : 0;
    if (options.order === `desc`) {
      cmp *= -1;
    }
    return cmp;
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
