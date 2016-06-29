import { Component } from 'panel';

import template from './tooltip.jade';

import css from './tooltip.styl';

document.registerElement('mp-tooltip', class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    const tooltip = this.el.querySelector('.mp-tooltip');
    const arrow = this.el.querySelector('.arrow');
    this.show = () => {
      tooltip.classList.remove('hidden');
      tooltip.style.left = this.parentNode.offsetLeft + (this.parentNode.offsetWidth / 2) - (tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = this.parentNode.offsetTop - tooltip.offsetHeight - 10 + 'px';
      arrow.style.left = (tooltip.offsetWidth / 2) - (arrow.offsetWidth / 2) + 'px';
    };
    this.hide = () => {
      tooltip.classList.add('hidden');
    };
    this.parentNode.addEventListener('mouseover', this.show);
    this.parentNode.addEventListener('mouseout', this.hide);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.parentNode.removeEventListener('mouseover', this.show);
    this.parentNode.removeEventListener('mouseout', this.hide);
  }
});
