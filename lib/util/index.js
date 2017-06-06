export * from './array';

// generic data-manipulation utils

export function commaizeNumber(number, noConversion) {
  switch (typeof number) {
    case `number`:
      if (isNaN(number)) {
        return number;
      }
      number = number.toString();
      break;
    case `string`:
      // noop
      break;
    default:
      return number;
  }

  let neg = false;
  if (number[0] === `-`) {
    neg = true;
    number = number.slice(1);
  }

  // Parse main number
  let split = number.split(`.`);
  let commaized = noConversion ? split[0] : parseInt(split[0] || 0, 10).toString();

  if (commaized.length) {
    commaized = commaized.split(``).reverse().join(``);
    commaized = commaized.match(/.{1,3}/g).join(`,`);
    commaized = commaized.split(``).reverse().join(``);
  }

  if (split[1]) {
    // Add decimals, if applicable
    commaized += `.` + split[1];
  }

  if (neg) {
    commaized = `-` + commaized;
  }

  return commaized;
}

export function abbreviateNumber(number, precision) {
  number = parseFloat(number);
  precision = (precision === undefined) ? 1 : precision;

  let largeNumbers = [
    [Math.pow(10, 15), `Q`],
    [Math.pow(10, 12), `T`],
    [Math.pow(10, 9), `B`],
    [Math.pow(10, 6), `M`],
    [Math.pow(10, 3), `K`],
  ];
  let suffix = ``;

  for (let i = 0; i < largeNumbers.length; i++) {
    let bignum = largeNumbers[i][0];
    let letter = largeNumbers[i][1];

    if (Math.abs(number) >= bignum) {
      number /= bignum;
      suffix = letter;
      break;
    }
  }

  let isNegative = number < 0;
  let fixed = number.toFixed(precision).split(`.`);
  let formatted = commaizeNumber(Math.abs(parseInt(fixed[0], 10)));

  if (fixed[1] && parseInt(fixed[1], 10) !== 0) {
    formatted += `.` + fixed[1];
  }

  return (isNegative ? `-` : ``) + formatted + suffix;
}

export function capitalize(string) {
  return string && string.charAt(0).toUpperCase() + string.slice(1);
}

export function extend() {
  return Object.assign(...[{}, ...Array.prototype.slice.call(arguments)]);
}

export function htmlEncodeString(val) {
  return String(val)
    .replace(/&/g, `&amp;`)
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`)
    .replace(/"/g, `&quot;`)
    .replace(/'/g, `&#039;`)
    .replace(/\r/g, `&#013;`)
    .replace(/\n/g, `&#010;`)
    ;
}

// return object with new keys and same values
export function mapKeys(obj, func) {
  return Object.keys(obj).reduce((ret, k) => Object.assign(ret, {[func(k, obj[k])]: obj[k]}), {});
}

// return object with same keys and new values
export function mapValues(obj, func) {
  return Object.keys(obj).reduce((ret, k) => Object.assign(ret, {[k]: func(obj[k], k)}), {});
}

export function nestedObjectDepth(obj) {
  return obj !== null && typeof obj === `object` ? nestedObjectDepth(obj[Object.keys(obj)[0]]) + 1 : 0;
}

function getKeys(obj, depth, keySet) {
  if (nestedObjectDepth(obj) > depth) {
    Object.values(obj).forEach(value => getKeys(value, depth, keySet));
  } else {
    Object.keys(obj).forEach(key => keySet.add(key));
  }
}

export function nestedObjectKeys(obj, depth=1) {
  const keys = new Set();
  getKeys(obj, depth, keys);
  return Array.from(keys);
}

export function objectFromPairs(pairs) {
  let object = {};
  pairs.forEach(pair => { object[pair[0]] = pair[1]; });
  return object;
}

export function objToQueryString(params) {
  return Object.keys(params).map(k => [k, encodeURIComponent(params[k])].join(`=`)).join(`&`);
}

export function parseUrl(url) {
  const parser = document.createElement(`a`);
  parser.href = url;
  return {
    host: parser.host,
    pathname: parser.pathname,
    url: parser.url,
  };
}

// filter object to include only given keys
export function pick(obj, keys) {
  return keys.reduce((ret, k) => Object.assign(ret, {[k]: obj[k]}), {});
}

export function pluralize(singular, number, plural) {
  plural = plural || (singular + `s`);
  return number === 0 || number > 1 ? plural : singular;
}

export function sum(arr) {
  let _sum = 0;
  for (let i = 0; i < arr.length; i++) {
    _sum += arr[i];
  }
  return _sum;
}

export function truncateMiddle(string, len) {
  if (string) {
    if (len <= 3) {
      return string.substr(0, len);
    } else if (string.length <= len) {
      return string;
    } else {
      var start = Math.ceil((len - 3) / 2);
      var end = -1 * Math.floor((len - 3) / 2);
      return string.substr(0, start) + `...` + (end ? string.substr(end) : ``);
    }
  }
  return string;
}

/**
 *  given a monotonically increasing function fn: integer => double,
 *  find the first integer i between start and end inclusive s.t. fn(i) >= 0
 *  or end if fn(end) < 0
 */
export function binarySearch(start, end, fn) {
  if (fn(start) >= 0) {
    return start;
  }
  if (fn(end) < 0) {
    return end;
  }
  while (end - start > 1) {
    const mid = Math.floor((end + start) / 2);
    if (fn(mid) < 0) {
      start = mid;
    } else {
      end = mid;
    }
  }
  return end;
}


// lazily initialize measureContext, rather than at module top-level,
// so that running tests from node does not cause an undefined
// variable error from document
let measureContext;
function getMeasureContext() {
  if(!measureContext) {
    measureContext = document.createElement(`canvas`).getContext(`2d`);
  }
  return measureContext;
}

export function measureTextWidth(string, font) {
  getMeasureContext().font = font;
  return getMeasureContext().measureText(string).width;
}

export function truncateToWidth(string, font, width) {
  getMeasureContext().font = font;
  // spaceLeft will give the amount of space left after truncating N chars off string
  const spaceLeft = nChars =>
        width - getMeasureContext().measureText(truncateMiddle(string, string.length - nChars)).width;
  // find the first N such that removing N chars allows the string to fit (spaceLeft is positive)
  const bestFit = binarySearch(0, string.length - 1, spaceLeft);
  return truncateMiddle(string, string.length - bestFit);
}

export function truncateToElement(string, elem) {
  let availableWidth = elem.clientWidth;
  const styles = window.getComputedStyle(elem);
  availableWidth -= parseInt(styles.getPropertyValue(`padding-left`));
  availableWidth -= parseInt(styles.getPropertyValue(`padding-right`));
  // Note: getPropertyValue('font') does not work in FF, so we construct a font property from its components
  const fontString = `font-style font-variant font-weight font-size font-family`
        .split(` `).map(prop => styles.getPropertyValue(prop)).join(` `);
  return truncateToWidth(string, fontString, availableWidth);
}

//get the rollingcount based on unit for calculating rolling average
export function getRollingCount(unit) {
  switch (unit) {
    case `hour`:
      return 12;
    case `day`:
      return 7;
    case `week`:
      return 5;
    case `month`:
      return 3;
  }
}

export function nestedObjectRolling(obj, rollingCount) {
  if (Object.keys(obj).map(key => obj[key]).every(value => typeof value === `number` || value === null)) {
    let found = false;
    const values = [];
    let sum = 0;
    const newObj = {};
    Object.keys(obj).sort().forEach(key => {
      var amount = obj[key];
      if (!found && amount) {
        found = true;
      }

      if (found) {
        if (values.length === rollingCount) {
          sum -= values[0];
          values.shift();
        }
        values.push(amount);
        sum += amount;
        amount = sum / values.length;
      }

      newObj[key] = amount;
    });
    return newObj;
  } else {
    return mapValues(obj, value => nestedObjectRolling(value, rollingCount));
  }
}

export function formatPercent(decimal, precision=2) {
  return (Math.round(decimal * Math.pow(10, precision + 2)) / Math.pow(10, precision)) + `%`;
}
/**
 * Sum the leaf values of a nested object, but filter out those whose value is 0.
 * constructing a new object with depth 1 less than the original
 */
export function nestedObjectSum(obj) {
  const sum = Object.values(obj).reduce((accum, val) => accum + val, 0);

  if (typeof sum === `number`) {
    return sum;
  } else {
    return objectFromPairs(Object.keys(obj)
      .map(key => [key, nestedObjectSum(obj[key])])
      .filter(key => key[1] !== 0));
  }
}
/**
 * Turn a nested object into a list of "path" arrays,
 * which represent all of its key combinations.
 * Example:
 *   {                     [['a', 'x', 1],
 *     a: {x: 1, y: 2}, =>  ['a', 'y', 2],
 *     b: {x: 1, y: 2},     ['b', 'x', 1],
 *   }                      ['b', 'y', 2]]
 * The depth param controls how deep into the object the
 * transformation is applied. Sub-objects of the given
 * depth will be placed at the last index of the path.
 * Example (depth=1):
 *   {                     [['a', {x: 1}],
 *     a: {x: 1, y: 2}, =>  ['a', {y: 2}],
 *     b: {x: 1, y: 2},     ['b', {x: 1}],
 *   }                      ['b', {y: 2}]]
 */
export function nestedObjectPaths(obj, depth=0) {
  let paths = [];

  function _getObjectPaths(obj, path=[]) {
    if (nestedObjectDepth(obj) > depth) {
      Object.keys(obj).forEach(key => _getObjectPaths(obj[key], [...path, key]));
    } else {
      paths.push([...path, obj]);
    }
  }

  _getObjectPaths(obj);

  return paths;
}

/**
 * Flatten a nested object to show all possible paths + corresponding values of that object
 * @param {string} obj - nested object to be flattened
 * @returns {object} with all nested keys seperated by spaces
 * @example
 * flattenNestedObjectToPath({'US': {'California': 1, 'New York' : 2}});
 * // {
 * //   values: {'US California': 1, 'US New York': 2},
 * //   paths: {{'US California': ['US', 'California'], 'US New York': ['US', 'New York']},
 * // }
 */
export function flattenNestedObjectToPath(series, {flattenValues=false, formatHeader=null}={}) {
  const paths = {};
  let values = nestedObjectPaths(series, 1).reduce((values, headers) => {
    const results = headers.pop();
    const key = formatHeader ? formatHeader(headers) : headers.join(` `);
    paths[key] = headers;
    return Object.assign(values, {[key]: results});
  }, {});
  if (flattenValues) {
    values = nestedObjectSum(values);
  }
  return {paths, values};
}
