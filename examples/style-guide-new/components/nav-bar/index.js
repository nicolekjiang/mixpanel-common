import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement('nav-bar', class extends Component {
  get config() {
    return {
      helpers: {
        navSectionChange: e => {
          let sectionOpen = e.currentTarget.dataset.sectionName;
          if (sectionOpen === this.state.sectionOpen) {
            sectionOpen = null;
          }
          this.update({sectionOpen});
        }
      },
      template,
    };
  }
});
