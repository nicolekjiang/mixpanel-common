import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';
import css from './index.styl';

export default registerMPElement(`mp-list-item`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        isActive: false,
        isSelected: false,
        isSelectedSelectable: false,
        hasIcon: false,
        icon: null,
      },
    };
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    super.attributeChangedCallback(...arguments);

    if (attr === `is-active`) {
      this.update({isActive: this.isAttributeEnabled(attr)});
    } else if (attr === `is-selected`) {
      this.update({isSelected: this.isAttributeEnabled(attr)});
    } else if (attr === `is-selected-selectable`) {
      this.update({isSelectedSelectable: this.isAttributeEnabled(attr)});
    } else if (attr === `has-icon`) {
      this.update({hasIcon: this.isAttributeEnabled(attr)});
    } else if (attr === `icon`) {
      this.update({icon: newValue});
    }
  }
});
