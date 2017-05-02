import { Component } from 'panel';

import { extend } from '../../../../build/util';

import template from './index.jade';
import './index.styl';

document.registerElement('components-section', class extends Component {
  get config() {
    return {
      helpers: {
        sectionChange: e => {
          this.update({sectionFilter: e.currentTarget.dataset.filterName});
        },
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
      },
      template,
    };
  }
});
