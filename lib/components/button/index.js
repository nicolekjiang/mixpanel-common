import Button from '../base/button';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';

import css from './index.styl';

export default registerMPElement(`mp-button`, class extends Button {
  get config() {
    return Object.assign(super.config, {
      css,
      template,
    });
  }
});
