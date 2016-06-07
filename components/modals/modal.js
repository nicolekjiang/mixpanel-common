import { Component } from 'panel';

import template from './modal.jade';

import css from './modal.styl';

document.registerElement('mp-modal', class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
    };
  }
});
