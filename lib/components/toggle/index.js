import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import css from './index.styl';
import template from './index.jade';

registerMPElement(`mp-toggle`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,

      helpers: {
        selectOption: value => this.value = value,
        toggleOptions: () => Array.from(this.children)
          .filter(el => el.tagName.toLowerCase() === `mp-toggle-option`)
          .map(el => ({
            text: el.textContent,
            value: el.getAttribute(`value`),
          })),
      },
    };
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(...arguments);
    if (attr === `selected`) {
      this.dispatchEvent(new CustomEvent(`select`, {detail: {selected: newVal}}));

      // TODO deprecated: switch consumers to 'select' event
      this.dispatchEvent(new CustomEvent(`change`, {detail: {selected: newVal}}));
    }
  }

  get value() {
    return this.getAttribute(`selected`);
  }

  set value(value) {
    this.setAttribute(`selected`, value);
  }
});
