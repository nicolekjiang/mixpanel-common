import { Component } from 'panel';

import { registerMPComponent } from  '../registration.js';

import template from './tooltip.jade';

import css from './tooltip.styl';

registerMPComponent('mp-tooltip', class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    const wrapper = this.el.querySelector('.mp-tooltip-wrapper');
    const tooltip = this.el.querySelector('.mp-tooltip-main');
    this.show = () => {
      wrapper.classList.remove('mp-tooltip-hidden');
      const leftPos = this.parentNode.offsetLeft + (this.parentNode.offsetWidth / 2) - (tooltip.offsetWidth / 2) + 'px';
      const topPos = this.parentNode.offsetTop - tooltip.offsetHeight - 8 + 'px';
      tooltip.style.left = leftPos;
      tooltip.style.top = topPos;
    };
    this.hide = () => {
      wrapper.classList.add('mp-tooltip-hidden');
    };
    this.stopPropagation = e => {
      e.stopPropagation();
    };
    this.parentNode.addEventListener('mouseover', this.show);
    this.parentNode.addEventListener('mouseleave', this.hide);
    this.el.addEventListener('click', this.stopPropagation);
    this.el.addEventListener('mousedown', this.stopPropagation);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.parentNode.removeEventListener('mouseover', this.show);
    this.parentNode.removeEventListener('mouseover', this.hide);
    this.el.removeEventListener('click', this.stopPropagation);
    this.el.removeEventListener('mousedown', this.stopPropagation);
  }
});
