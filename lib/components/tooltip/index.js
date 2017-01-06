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
        placementClass: ``,
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
      placementClass: `mp-tooltip-placement-${placement}`,
      isVisible: true,
    });

    window.requestAnimationFrame(() => {
      const leftOffset = this.parentNode.offsetLeft + (this.parentNode.offsetWidth / 2) - (tooltip.offsetWidth / 2);

      let topOffset;
      if (placement === `bottom`) {
        topOffset = this.parentNode.offsetTop + this.parentNode.offsetHeight + 8;
      } else if (placement === `top`) {
        topOffset = this.parentNode.offsetTop - tooltip.offsetHeight - 8;
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
