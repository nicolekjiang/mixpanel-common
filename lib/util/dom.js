export function clickWasOutside(clickEvent, subjectEl) {
  // events from shadow DOM will be retargeted to appear as if they come from component
  // use path to distinguish between events within nested components
  const path = window.ShadowDOMPolyfill ? clickEvent.path : clickEvent.composedPath();
  return !path.includes(subjectEl);
}


export const ANIMATION_END_EVENTS = [`webkitAnimationEnd`, `animationend`, `oAnimationEnd`, `MSAnimationEnd`];

export const onAnimationEnd = (el, callback) => {
  ANIMATION_END_EVENTS.forEach(e => el.addEventListener(e, callback));
};

export const offAnimationEnd = (el, callback) => {
  ANIMATION_END_EVENTS.forEach(e => el.removeEventListener(e, callback));
};
