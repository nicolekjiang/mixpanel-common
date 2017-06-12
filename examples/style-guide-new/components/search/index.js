import {Component} from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement(`search-section`, class extends Component {
  get config() {
    return {
      template,
      helpers: {
        inputKeyUp: e => {
          if (e.target.value.length === 0) {
            this.update({sectionOpen: this.state.previousSectionOpen});
          } else {
            const searchTerm = e.target.value.toLowerCase();
            this.update({searchTerm});
            this.app.matchSearchTerms(searchTerm);
          }
        },
      },
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    const searchInput = this.el.querySelector(`input.title-text`);
    searchInput.value = this.state.searchTermPrompt;
    searchInput.focus();
    this.clearSearch = e => {
      // escape key
      if (e.which === 27) {
        this.update({sectionOpen: this.state.previousSectionOpen});
      }
    };
    this.addEventListener(`keydown`, this.clearSearch);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.update({searchTerm: null, searchTermPrompt: null});
  }
});
