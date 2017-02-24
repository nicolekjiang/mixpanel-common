/* global DEBUG_LOG */

// mixpanel-specific report utils

import { capitalize, extend, htmlEncodeString } from '../util';
import { COUNTRIES, EVENTS, PROPERTIES } from './constants';

/*
 * downloadData()
 *
 * Initiates a direct download to the browser for any HTTP method,
 * using a terrible hack of submitting a hidden form to a hidden
 * iframe target.
 *
 */
let downloadIdCounter = 1;
export function downloadData(endpoint, params, method=`POST`) {
  // prepare target iframe
  const exportFrameID = `download-frame-${downloadIdCounter++}`;
  const exportFrame = document.createElement(`iframe`);
  exportFrame.id = exportFrameID;
  exportFrame.name = exportFrameID;
  exportFrame.src = ``;
  exportFrame.style.display = `none`;
  document.body.appendChild(exportFrame);

  // prepare source form
  const postForm = document.createElement(`form`);
  postForm.action = endpoint;
  postForm.method = method;
  postForm.style.display = `none`;
  postForm.target = exportFrameID;
  postForm.innerHTML = Object.keys(params)
    .map(p => `<input type="hidden" name="${p}" value="${htmlEncodeString(params[p])}"/>`)
    .join(``);

  // submit request
  document.body.appendChild(postForm);
  postForm.submit();
}

// TODO epurcer - replace this with a more general-purpose tool like https://www.npmjs.com/package/debug
function getLogger(level) {
  if (typeof DEBUG_LOG !== `undefined` && DEBUG_LOG) {
    /* eslint-disable no-console */
    return function() { console[level](...arguments); };
    /* eslint-enable no-console */
  } else {
    return function() {};
  }
}
export const debug = [`log`, `info`, `warn`, `error`, `critical`].reduce((ret, level) =>
  extend(ret, {[level]: getLogger(level)}), {});

export function renameEvent(event) {
  if (EVENTS.hasOwnProperty(event)) {
    return EVENTS[event];
  }

  return event;
}

export function renameProperty(property) {
  const remappedProperty = PROPERTIES[property];
  if (remappedProperty) {
    return remappedProperty;
  }

  // default conversion for all properties starting with '$'
  if (property && property.length > 1 && property[0] === `$`) {
    return property
      .slice(1)
      .split(`_`)
      .map(capitalize)
      .join(` `);
  }

  return property;
}

export function renamePropertyType(type) {
  return {
    number: `Integer`,
    datetime: `Date`,
    boolean: `True/False`,
  }[type] || capitalize(type);
}

export function renameCountryCode(value) {
  const country = COUNTRIES[String(value).toUpperCase()];
  if (country) {
    return country;
  }
  return value;
}

export function renamePropertyValue(propertyName, value) {
  if (propertyName === `$event`) {
    return renameEvent(value);
  } else if (/country_code/.test(propertyName)) {
    return renameCountryCode(value);
  }
  return value;
}
