import {Component} from 'panel';

import exampleBlockTerms from './component-search-terms.json';

import template from './index.jade';
import './index.styl';

document.registerElement(`components-section`, class extends Component {
  get config() {
    return {
      template,
      helpers: {
        openModal: key => {
          this.state.open[key] = true;
          this.update();
        },
        closeModal: key => {
          this.state.open[key] = false;
          this.update();
        },
        handleModalChange: (key, state) => {
          this.state.open[key] = state === `open`;
          this.update();
        },
        toggleTutorialTooltip: name => {
          this.state.open.tutorialTooltip = {};
          this.state.open.tutorialTooltip[name] = true;
          this.update();
        },
        showExampleblock: exampleName => {
          let match = true;
          if (this.state.sectionOpen === `search`) {
            const exampleTerms = exampleBlockTerms[exampleName];
            const searchTerms = this.state.searchTerm.split(` `);
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
        },
      },
    };
  }
});
