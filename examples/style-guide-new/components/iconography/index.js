import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement('iconography-section', class extends Component {
  get config() {
    return {
      defaultState: {
        sectionFilter: 'show all',
        iconSize: 'two'
      },
      helpers: {
        sectionChange: e => {
          this.update({sectionFilter: e.currentTarget.dataset.filterName});
        },
        changeIconSize: iconSize => {
          this.update({iconSize})
        }
      },
      template,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
  }
});
