import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';
import css from './index.styl';

export default registerMPElement(`mp-list-item`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
    };
  }
});
