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
        hideSectionOnSearch: sectionId => {
          const sectionKeywords = sectionId.split('-').join(' ');
          if (this.state.sectionOpen != 'search' || sectionKeywords.includes(this.state.searchTerm)) {
            return false
          }
          return true;
        },
      },
      template,
    };
  }
});
