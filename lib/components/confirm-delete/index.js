import Confirm from '../base/confirm';

import { registerMPComponent } from  '../registration.js';

import template from './index.jade';

import css from './index.styl';

registerMPComponent('mp-confirm-delete', class extends Confirm {
  get config() {
    return Object.assign(super.config, {
      css,
      template,
    });
  }
});
