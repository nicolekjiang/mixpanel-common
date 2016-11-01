import { Component } from 'panel';

import { registerMPComponent } from  '../registration.js';

import css from './index.styl';
import template from './index.jade';

registerMPComponent('mp-toggle', class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,

      helpers: {
        selectOption: value => this.value = value,
        toggleOptions: () => Array.from(this.querySelectorAll('mp-toggle-option')).map(el => ({
          text: el.textContent,
          value: el.getAttribute('value'),
        })),
      },
    };
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(...arguments);
    if (attr === 'selected') {
      this.dispatchEvent(new CustomEvent('change', {detail: {selected: newVal}}));
    }
  }

  get value() {
    return this.getAttribute('selected');
  }

  set value(value) {
    this.setAttribute('selected', value);
  }
});
