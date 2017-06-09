import {Component} from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement(`iconography-section`, class extends Component {
  get config() {
    return {
      template,
      defaultState: {
        iconSize: `two`,
      },
      helpers: {
        changeIconSize: iconSize => {
          this.update({iconSize});
        },
      },
    };
  }
});
