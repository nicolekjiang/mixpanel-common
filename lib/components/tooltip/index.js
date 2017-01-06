import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';

import css from './index.styl';

registerMPElement(`mp-tooltip`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        isVisible: false,
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
      isVisible: true,
      // Use a large negative offset so that the tooltip is off-screen until it's properly positioned.
      leftOffset: -9999,
      placement: placement,
      topOffset: -9999,
    });

    window.requestAnimationFrame(() => {
      // Since computation of top/left offsets depend on tooltip's height/width, these offsets must be computed
      // after tooltip is visible, hence in requestAnimationFrame.

      let leftOffset;
      let topOffset;
      if (placement === `top` || placement === `bottom`) {
        leftOffset = this.parentNode.offsetLeft + (this.parentNode.offsetWidth - tooltip.offsetWidth) / 2;
        if (placement === `top`) {
          topOffset = this.parentNode.offsetTop - tooltip.offsetHeight - 8;
        } else {
          topOffset = this.parentNode.offsetTop + this.parentNode.offsetHeight + 8;
        }
      } else if (placement === `left` || placement === `right`) {
        topOffset = this.parentNode.offsetTop + (this.parentNode.offsetHeight - tooltip.offsetHeight) / 2;
        if (placement === `left`) {
          leftOffset = this.parentNode.offsetLeft - tooltip.offsetWidth - 8;
        } else {
          leftOffset = this.parentNode.offsetLeft + this.parentNode.offsetWidth + 8;
        }
      }

      this.update({
        leftOffset,
        topOffset,
      });
    });
  }

  hide() {
    this.update({isVisible: false});
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);

    this.parentNode.addEventListener(`mouseover`, this.show);
    this.parentNode.addEventListener(`mouseleave`, this.hide);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.parentNode.removeEventListener(`mouseover`, this.show);
    this.parentNode.removeEventListener(`mouseleave`, this.hide);
  }
});
