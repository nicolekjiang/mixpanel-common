import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement('search-section', class extends Component {
  get config() {
    return {
      helpers: {
        inputKeyDown: e => {
          let searchTerm = e.target.value.length > 0 ? e.target.value.toLowerCase() : null;
          this.update({searchTerm});
          this.app.matchSearchTerms(searchTerm);
        },
      },
      template,
    };
  }
  attachedCallback() {
    super.attachedCallback(...arguments);
    setTimeout(() => this.el.querySelector('.mp-search input').focus(), 100);
  }
  detachedCallback() {
    super.detachedCallback(...arguments);
    this.update({searchTerm: null});
  }
});