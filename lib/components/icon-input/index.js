import {Component} from 'panel';

import {registerMPElement} from  '../../util/register-element.js';

import css from './index.styl';
import template from './index.jade';

export default registerMPElement(`mp-icon-input`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      helpers: {
      },
    };
  }

  focus() {
    this.el.querySelector(`input`).focus();
  }

  get value() {
    return this.el.querySelector(`input`).value;
  }
});
