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
    const wrapper = this.el.querySelector('.wrapper');
    const tooltip = this.el.querySelector('.mp-tooltip');
    const arrow = this.el.querySelector('.arrow');
    const hiddenBackground = this.el.querySelector('.hidden-background');
    this.show = () => {
      wrapper.classList.remove('hidden');
      const leftPos = this.parentNode.offsetLeft + (this.parentNode.offsetWidth / 2) - (tooltip.offsetWidth / 2) + 'px';
      const topPos = this.parentNode.offsetTop - tooltip.offsetHeight - 10 + 'px';
      tooltip.style.left = leftPos;
      tooltip.style.top = topPos;
      arrow.style.left = (tooltip.offsetWidth / 2) - (arrow.offsetWidth / 2) + 'px';
      hiddenBackground.style.left = leftPos;
      hiddenBackground.style.top = topPos;
      hiddenBackground.style.height = tooltip.offsetHeight + 10 + 'px';
      hiddenBackground.style.width = tooltip.offsetWidth + 'px';
    };
    this.hide = () => {
      wrapper.classList.add('hidden');
    };
    this.preventClicks = e => {
      e.stopPropagation();
    };
    this.parentNode.addEventListener('mouseover', this.show);
    this.parentNode.addEventListener('mouseleave', this.hide);
    this.el.addEventListener('click', this.preventClicks);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.parentNode.removeEventListener('mouseover', this.show);
    this.parentNode.removeEventListener('mouseover', this.hide);
    this.el.removeEventListener('click', this.preventClicks);
  }
});
