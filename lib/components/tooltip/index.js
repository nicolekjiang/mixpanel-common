import {Component} from 'panel';

import {registerMPElement} from  '../../util/register-element.js';

import template from './index.jade';

import css from './index.styl';

const VISIBILITY_HIDDEN = `hidden`;
const VISIBILITY_TRANSITIONING = `transitioning`;
const VISIBILITY_VISIBLE = `visible`;

export default registerMPElement(`mp-tooltip`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        visibility: VISIBILITY_HIDDEN,
        leftOffset: 0,
        placement: ``,
        topOffset: 0,
      },
      helpers: {
        stopPropagation: e => {
          e.stopPropagation();
        },
      },
    };
  }

  show() {
    const tooltip = this.el.querySelector(`.mp-tooltip-main`);

    const placement = this.getAttribute(`placement`) || `top`;
    this.update({
      visibility: VISIBILITY_TRANSITIONING,
      placement,
      icon: this.getAttribute(`icon`),
      iconWhite: this.getAttribute(`icon-white`),
    });

    window.requestAnimationFrame(() => {
      // Since computation of top/left offsets depend on tooltip's height/width, these offsets must be computed
      // after tooltip is visible, hence in requestAnimationFrame.

      let parentOffsetLeft;
      let parentOffsetTop;
      const parentPosition = window.getComputedStyle(this.parentNode).getPropertyValue(`position`);
      // The tooltip has position absolute, which means it will be positioned relative to the nearest ancestor with
      // non-static position. Different handling is needed depending on whether the direct parent of the tooltip
      // has non-static positioning.
      if (parentPosition === `static`) {
        parentOffsetLeft = this.parentNode.offsetLeft;
        parentOffsetTop = this.parentNode.offsetTop;
      } else {
        parentOffsetLeft = 0;
        parentOffsetTop = 0;
      }

      let leftOffset;
      let topOffset;
      if (placement === `top` || placement === `bottom`) {
        leftOffset = parentOffsetLeft + (this.parentNode.offsetWidth - tooltip.offsetWidth) / 2;
        if (placement === `top`) {
          topOffset = parentOffsetTop - tooltip.offsetHeight - 8;
        } else {
          topOffset = parentOffsetTop + this.parentNode.offsetHeight + 8;
        }
      } else if (placement === `left` || placement === `right`) {
        topOffset = parentOffsetTop + (this.parentNode.offsetHeight - tooltip.offsetHeight) / 2;
        if (placement === `left`) {
          leftOffset = parentOffsetLeft - tooltip.offsetWidth - 8;
        } else {
          leftOffset = parentOffsetLeft + this.parentNode.offsetWidth + 8;
        }
      }

      this.update({
        leftOffset,
        topOffset,
        visibility: VISIBILITY_VISIBLE,
      });
    });
  }

  hide() {
    this.update({visibility: VISIBILITY_HIDDEN});
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);

    this.host = this.parentNode;
    this.host.addEventListener(`mouseenter`, this.show);
    this.host.addEventListener(`mouseleave`, this.hide);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);

    this.host.removeEventListener(`mouseenter`, this.show);
    this.host.removeEventListener(`mouseleave`, this.hide);
  }
});
