import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement('typography-section', class extends Component {
  get config() {
    return {
      helpers: {
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
