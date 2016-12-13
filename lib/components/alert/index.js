import { Component } from 'panel';

import { registerMPComponent } from  '../registration.js';

import template from './index.jade';

import css from './index.styl';

registerMPComponent('mp-alert', class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
    };
  }
});
