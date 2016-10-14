import { Component } from 'panel';

import '../registration.js';

import template from './button.jade';

import css from './button.styl';

class MPButton extends Component {
  get config() {
    return {
      css,
      helpers: {
        getButtonAttrs: () => {
          const attrs = {};
          if (this.isAttributeEnabled(`disabled`)) {
            attrs.disabled = true;
          }
          return attrs;
        },
      },
      template,
      useShadowDom: true,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    this._clickHandler = e => {
      if (this.isAttributeEnabled(`disabled`)) {
        e.stopImmediatePropagation();
      }
    };
    this.el.addEventListener(`click`, this._clickHandler);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.el.removeEventListener(`click`, this._clickHandler);
    this._clickHandler = null;
  }
}

if (window[`mp-common-registered-components`][`mp-button`] !== true) {
  document.registerElement(`mp-button`, MPButton);
  window[`mp-common-registered-components`][`mp-button`] = true;
}
