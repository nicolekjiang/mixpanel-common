export function clickWasOutside(clickEvent, subjectEl) {
  // events from shadow DOM will be retargeted to appear as if they come from component
  // use path to distinguish between events within nested components
  const path = window.ShadowDOMPolyfill ? clickEvent.path : clickEvent.composedPath();
  return !path.includes(subjectEl);
}


export const ANIMATION_END_EVENTS = [`webkitAnimationEnd`, `animationend`, `oAnimationEnd`, `MSAnimationEnd`];


// TODO update the component API to stop using this
// i.e. don't proxy arbitrary class names from the outside
// world; offer a limited set of attrs for theming
export function extendComponentClasses(extraClasses) {
  const componentClasses = {};
  for (const className of this.classList) {
    componentClasses[className] = true;
  }
  return Object.assign(componentClasses, extraClasses);
}

export const onAnimationEnd = (el, callback) => {
  ANIMATION_END_EVENTS.forEach(e => el.addEventListener(e, callback));
};

export const offAnimationEnd = (el, callback) => {
  ANIMATION_END_EVENTS.forEach(e => el.removeEventListener(e, callback));
};
