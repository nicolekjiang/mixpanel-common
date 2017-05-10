import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement('iconography-section', class extends Component {
  get config() {
    return {
      defaultState: {
        iconSize: 'two'
      },
      helpers: {
        changeIconSize: iconSize => {
          this.update({iconSize})
        },
      },
      template,
    };
  }
});
