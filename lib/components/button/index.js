import Button from '../base/button';

import { registerMPComponent } from  '../registration.js';

import template from './index.jade';

import css from './index.styl';

registerMPComponent('mp-button', class extends Button {
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
});
