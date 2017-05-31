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
    this._placement = this.getAttribute(`placement`) || `top`;
    this.update({
      visibility: VISIBILITY_TRANSITIONING,
      placement: this._placement,
    });

    window.cancelAnimationFrame(this._lastRaf);
    this._lastRaf = window.requestAnimationFrame(this._showAfterRAF.bind(this));
  }
  _showAfterRAF() {
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
    if (this._placement === `top` || this._placement === `bottom`) {
      leftOffset = parentOffsetLeft + (this.parentNode.offsetWidth - this._tooltipEl.offsetWidth) / 2;
      if (this._placement === `top`) {
        topOffset = parentOffsetTop - this._tooltipEl.offsetHeight - 8;
      } else {
        topOffset = parentOffsetTop + this.parentNode.offsetHeight + 8;
      }
    } else if (this._placement === `left` || this._placement === `right`) {
      topOffset = parentOffsetTop + (this.parentNode.offsetHeight - this._tooltipEl.offsetHeight) / 2;
      if (this._placement === `left`) {
        leftOffset = parentOffsetLeft - this._tooltipEl.offsetWidth - 8;
      } else {
        leftOffset = parentOffsetLeft + this.parentNode.offsetWidth + 8;
      }
    }

    this.update({
      leftOffset,
      topOffset,
      visibility: VISIBILITY_VISIBLE,
    });
  }

  hide() {
    window.cancelAnimationFrame(this._lastRaf);
    this.update({visibility: VISIBILITY_HIDDEN});
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    this._tooltipEl = this.el.querySelector(`.mp-tooltip-main`);

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
