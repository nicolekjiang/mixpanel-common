import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

document.registerElement('buttons-section', class extends Component {
  get config() {
    return {
      defaultState: {
        sectionFilter: 'show all',
      },
      helpers: {
        sectionChange: e => {
          this.update({sectionFilter: e.currentTarget.dataset.filterName});
        },
        handleModalChange: (key, state) => {
          this.state.open[key] = state === `open`;
          this.update();
        },
        toggleMenu: key => {
          this.state.open[key] = !this.state.open[key];
          this.update();
        },
      },
      template,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
  }
});
