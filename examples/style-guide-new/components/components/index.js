import { Component } from 'panel';

import { extend } from '../../../../build/util';

import template from './index.jade';
import './index.styl';

document.registerElement('components-section', class extends Component {
  get config() {
    return {
      helpers: {
        openModal: key => {
          this.state.open[key] = true;
          this.update();
        },
        handleModalChange: (key, state) => {
          this.state.open[key] = state === `open`;
          this.update();
        },
        toggleTutorialTooltip: name => {
          this.update({
            open: extend(open, {
              tutorialTooltip: {
                [name]: !this.state.open.tutorialTooltip[name],
              },
            }),
          });
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
