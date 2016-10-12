import 'babel-polyfill'
import 'webcomponents.js/webcomponents';

import { Component } from 'panel';

import '../../lib/index'; // import mixpanel-common

import template from './index.jade';

import css from './index.styl';

document.registerElement('demo-app', class extends Component {

  get config() {
    return {
      css,

      defaultState: {
        modalOpen: false,
      },

      helpers: {
        openModal: () => {
          this.update({modalOpen: true});
        },

        closeModal: () => {
          this.update({modalOpen: false});
        },

        handleModalChange: (e) => {
          switch(e.detail.state) {
            case 'closed':
              this.update({modalOpen: false});
              break;
            case 'open':
              this.update({modalOpen: true});
              break;
          }
        },
      },

      template,

      useShadowDom: true,
    };
  }
});
