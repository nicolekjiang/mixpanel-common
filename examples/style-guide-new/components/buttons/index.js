import { Component } from 'panel';

import exampleBlockTerms from './button-search-terms.json'

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
        showExampleblock: exampleName => {
          let match = true;
          if (this.state.sectionOpen == 'search'){
            const exampleTerms = exampleBlockTerms[exampleName];
            const searchTerms = this.state.searchTerm.split(' ');
            searchTerms.forEach(t => {
              let partialMatch = false;
              exampleTerms.forEach(e => {
                if (e.includes(t)) {
                  partialMatch = true;
                }
              });
              if (!partialMatch) {
                match = false;
              }
            });
          }
          return match;
        }
      },
      template,
    };
  }
});
