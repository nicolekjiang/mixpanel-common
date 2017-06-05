import {Component} from 'panel';
import {registerMPElement} from  '../../util/register-element';
import {nameToInitials} from '../../util/string';

import template from './index.jade';
import css from './index.styl';

export default registerMPElement(`mp-user-icon`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        name: null,
        showTooltip: true,
        tooltipText: null,
      },
      helpers: {
        nameToInitials,
        getAbbreviatedName: () => {
          const nameParts = this.state.name.split(` `);
          return nameParts.length > 1 ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.` : this.state.name;
        },
      },
    };
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(...arguments);
    switch (attr) {
      case `name`:
        this.update({name: newVal});
        break;
      case `show-tooltip`:
        this.update({showTooltip: this.isAttributeEnabled(attr)});
        break;
      case `tooltip-text`:
        if (newVal) {
          this.update({tooltipText: newVal});
        } else {
          this.update({tooltipText: null});
        }
        break;
    }
  }
});
