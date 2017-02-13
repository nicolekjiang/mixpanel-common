import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';

import css from './index.styl';

registerMPElement(`mp-upsell-popup`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
    };
  }
});
