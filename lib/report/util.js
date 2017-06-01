/* global DEBUG_LOG */

// mixpanel-specific report utils

import {capitalize, extend, htmlEncodeString} from '../util';
import {COUNTRIES, EVENTS, PROPERTIES} from './constants';

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

export function downloadLocalCSVData(filename, dataStr) {
  // launch named download via hidden link
  const link = document.createElement(`a`);

  const downloadAttrSupported = `download` in link;
  if (downloadAttrSupported) {
    // prepare blob
    const blob = new Blob([dataStr], {type: `text/csv;charset=utf-8`});
    const blobURL = URL.createObjectURL(blob);

    // launch named download via hidden link
    link.style.display = `none`;
    link.href = blobURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // clean up
    URL.revokeObjectURL(blobURL);
    link.remove();
  } else {
    // Work-around for Safari. One drawback of this method is that it doesn't support setting a filename.
    // On Safari, it downloads the file with the name 'Unknown'
    window.open(`data:attachment/csv;charset=utf-8,` + encodeURIComponent(dataStr));
  }
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

export function getIconForEvent(mpEvent) {
  if (mpEvent.is_collect_everything_event) {
    return `autotrack`;
  } else if (mpEvent.custom) {
    return `custom-events`;
  } else {
    return `event`;
  }
}

export function getDescriptionForEvent(mpEvent, eventDefinitions) {
  let predicate = definition => definition.name === mpEvent.name && !definition.collectEverythingEventId && !definition.customEventId;
  if (mpEvent.is_collect_everything_event) {
    predicate = definition => definition.collectEverythingEventId === mpEvent.id;
  } else if (mpEvent.custom) {
    predicate = definition => definition.customEventId === mpEvent.id;
  }

  const eventDefinition = eventDefinitions.find(predicate);
  return eventDefinition ? eventDefinition.description : null;
}

export function renameEvent(event) {
  if (EVENTS.hasOwnProperty(event)) {
    return EVENTS[event];
  }

  return event;
}

const PROPERTY_TYPE_ICON_MAP = {
  boolean: `type-boolean`,
  datetime: `type-date`,
  list: `type-list`,
  number: `type-number`,
  string: `type-text`,
};

export function getIconForPropertyType(type) {
  return PROPERTY_TYPE_ICON_MAP[type];
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
  return COUNTRIES[String(value).toUpperCase()] || value;
}

export function renamePropertyValue(value, propertyName) {
  if (propertyName === `$event`) {
    return renameEvent(value);
  } else if (propertyName === `$people`) {
    return renameProperty(value); // value is $all_people
  } else if (/country_code/.test(propertyName)) {
    return renameCountryCode(value);
  }
  return value;
}
