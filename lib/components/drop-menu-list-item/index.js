import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';
import css from './index.styl';

export default registerMPElement(`mp-drop-menu-list-item`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        label: null,
        labelParts: null,
        secondaryLabel: null,
        isSelected: false,
        isSelectedSelectable: false,
        isUpperCase: false,
        icon: null,
        pillLabel: null,
        hasCaret: false,
        isDeletable: false,
      },
      helpers: {
        handleClickPill: e => {
          e.stopPropagation();
          this.dispatchEvent(new CustomEvent(`clickPill`));
        },

        handleClickDelete: e => {
          e.stopPropagation();
          this.dispatchEvent(new CustomEvent(`clickDelete`));
        },
      },
    };
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    super.attributeChangedCallback(...arguments);

    if (attr === `label`) {
      this.update({label: newValue});
    } else if (attr === `label-parts`) {
      this.update({labelParts: this.getJSONAttribute(attr)});
    } else if (attr === `secondary-label`) {
      this.update({secondaryLabel: newValue});
    } else if (attr === `is-selected`) {
      this.update({isSelected: this.isAttributeEnabled(attr)});
    } else if (attr === `is-selected-selectable`) {
      this.update({isSelectedSelectable: this.isAttributeEnabled(attr)});
    } else if (attr === `is-upper-case`) {
      this.update({isUpperCase: this.isAttributeEnabled(attr)});
    } else if (attr === `icon`) {
      this.update({icon: newValue});
    } else if (attr === `pill-label`) {
      this.update({pillLabel: newValue});
    } else if (attr === `has-caret`) {
      this.update({hasCaret: this.isAttributeEnabled(attr)});
    } else if (attr === `is-deletable`) {
      this.update({isDeletable: this.isAttributeEnabled(attr)});
    }
  }
});
