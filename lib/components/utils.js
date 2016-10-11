export const ANIMATION_END_EVENTS = ['webkitAnimationEnd', 'animationend', 'oAnimationEnd', 'MSAnimationEnd'];

export const onAnimationEnd = (el, callback) => {
  ANIMATION_END_EVENTS.forEach(e => el.addEventListener(e, callback));
};

export const offAnimationEnd = (el, callback) => {
  ANIMATION_END_EVENTS.forEach(e => el.removeEventListener(e, callback));
};


