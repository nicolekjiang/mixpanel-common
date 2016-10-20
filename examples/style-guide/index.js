import 'babel-polyfill'
import 'webcomponents.js/webcomponents';

import { Component, h } from 'panel';

import '../../lib/index';
import colors from '../../stylesheets/colors.json';

import template from './index.jade';
import './index.styl';

document.registerElement('style-guide', class extends Component {
  get config() {
    return {
      defaultState: {
        colors,
      },
      helpers: {
        closeModal: selector => this.el.querySelector(selector).close(),
        openModal: selector => {
          this.el.querySelector(selector).open();
          return false;
        },
      },
      template,
    };
  }
});
