import { Component } from 'panel';

import template from './button.jade';

import css from './button.styl';

document.registerElement('mp-button', class extends Component {
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

  attachedCallback() {
    super.attachedCallback(...arguments);
    this._clickHandler = (e) => {
      if (this.isAttributeEnabled('disabled')) {
        e.stopImmediatePropagation();
      }
    }
    this.el.addEventListener('click', this._clickHandler);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.el.removeEventListener('click', this._clickHandler);
    this._clickHandler = null;
  }
});
