import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement('search-section', class extends Component {
  get config() {
    return {
      helpers: {
        inputKeyUp: e => {
          if (e.target.value.length == 0) {
            this.update({sectionOpen: this.state.previousSectionOpen})
          } else {
            let searchTerm = e.target.value.toLowerCase();
            this.update({searchTerm});
            this.app.matchSearchTerms(searchTerm);
          }
        },
      },
      template,
    };
  }
  attachedCallback() {
    super.attachedCallback(...arguments);
    const searchInput = this.el.querySelector('input.title-text');
    searchInput.value = this.state.searchTermPrompt;
    searchInput.focus();
  }
  detachedCallback() {
    super.detachedCallback(...arguments);
    this.update({searchTerm: null, searchTermPrompt: null});
  }
});
