import { Component } from 'panel';

import template from './index.jade';

import css from './index.styl';

document.registerElement('demo-app', class extends Component {

  get config() {
    return {
      css,

      defaultState: {
        buttonSet: 1,
      },

      helpers: {
        nextState: () => {
          this.update({buttonSet: 2});
        },

        prevState: () => {
          this.update({buttonSet: 1});
        },
      },

      template,

      useShadowDom: true,
    };
  }

});
