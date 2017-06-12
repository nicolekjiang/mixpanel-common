import {Component} from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement(`typography-section`, class extends Component {
  get config() {
    return {
      template,
    };
  }
});
