import Confirm from '../base/confirm';

import { registerMPElement } from  '../../register-element.js';

import template from './index.jade';

import css from './index.styl';

registerMPElement('mp-confirm-delete', class extends Confirm {
  get config() {
    return Object.assign(super.config, {
      css,
      template,
    });
  }
});
