import Button from '../base/button';

import { registerMPComponent } from  '../registration.js';

import template from './index.jade';

import css from './index.styl';

registerMPComponent('mp-button-bar', class extends Button {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
    };
  }
});
