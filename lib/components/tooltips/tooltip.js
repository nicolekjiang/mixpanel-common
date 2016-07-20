import { Component } from 'panel';

import template from './tooltip.jade';

import css from './tooltip.styl';

class MPTooltip extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    const wrapper = this.el.querySelector('.wrapper');
    const tooltip = this.el.querySelector('.mp-tooltip');
    this.show = () => {
      wrapper.classList.remove('hidden');
      const leftPos = this.parentNode.offsetLeft + (this.parentNode.offsetWidth / 2) - (tooltip.offsetWidth / 2) + 'px';
      const topPos = this.parentNode.offsetTop - tooltip.offsetHeight - 8 + 'px';
      tooltip.style.left = leftPos;
      tooltip.style.top = topPos;
    };
    this.hide = () => {
      wrapper.classList.add('hidden');
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
}

if (window['mp-common-registered-components']['mp-tooltip'] !== true) {
  document.registerElement('mp-tooltip', MPTooltip);
  window['mp-common-registered-components']['mp-tooltip'] = true;
}
