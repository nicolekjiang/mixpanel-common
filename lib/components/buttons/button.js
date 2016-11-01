import { Component } from 'panel';

import { registerMPComponent } from  '../registration.js';

import template from './button.jade';

import css from './button.styl';

registerMPComponent('mp-button', class extends Component {
  get config() {
    return {
      css,
      helpers: {
        getButtonAttrs: () => {
          const attrs = {};
          if (this.isAttributeEnabled('disabled')) {
            attrs.disabled = true;
          }
          return attrs;
        },
      },
      template,
      useShadowDom: true,
    };
  }

  get disabled() {
    return this.getAttribute('disabled');
  }

  set disabled(disabled) {
    this.setAttribute('disabled', disabled);
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    this._clickHandler = (e) => {
      if (this.isAttributeEnabled('disabled')) {
        e.stopImmediatePropagation();
      }
    };
    this.el.addEventListener('click', this._clickHandler);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.el.removeEventListener('click', this._clickHandler);
    this._clickHandler = null;
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(...arguments);
    // handle boolean attributes a bit better than HTML does by default: https://www.w3.org/TR/html5/infrastructure.html#boolean-attribute
    // if it's set to "false" just remove the attribute
    if (newVal === 'false') {
      this.removeAttribute(attr);
    }
  }
});
