import { Component } from 'panel';

import { registerMPElement } from  '../../register-element.js';

import template from './index.jade';

import css from './index.styl';

registerMPElement('mp-alert', class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
    };
  }
});
