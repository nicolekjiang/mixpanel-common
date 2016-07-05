export function immutableSplice(array, ...args) {
  let copy = array.slice(0);
  copy.splice(...args);
  return copy;
}

export function removeByIndex(array, index) {
  if (index >= array.length || index < -array.length) {
    throw 'IndexError: array index out of range';
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
    throw 'IndexError: array index out of range';
  }
  return immutableSplice(array, index, 1, value);
}

export function insertAtIndex(array, index, value) {
  if (index > array.length || index < -array.length) {
    throw 'IndexError: array index out of range';
  }
  return immutableSplice(array, index, 0, value);
}

export function unique(array) {
  let uniqueArray = [];
  array.forEach(val => !uniqueArray.includes(val) && uniqueArray.push(val));
  return uniqueArray;
}
