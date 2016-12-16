/**
 * Supports registering MP web components safely even when multiple
 * copies of this library are loaded separately on the same page
 * (e.g., autotrack editor on a page which already has these components).
 */
export function registerMPElement(tagName, componentClass) {
  let registry = window[`mp-common-registered-components`];
  if (!registry) {
    window[`mp-common-registered-components`] = registry = {};
  }

  if (!registry[tagName]) {
    registry[tagName] = document.registerElement(tagName, componentClass);
  }
}
