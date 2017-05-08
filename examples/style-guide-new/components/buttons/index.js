import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement('buttons-section', class extends Component {
  get config() {
    return {
      helpers: {
        handleModalChange: (key, state) => {
          this.state.open[key] = state === `open`;
          this.update();
        },
        toggleMenu: key => {
          this.state.open[key] = !this.state.open[key];
          this.update();
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
