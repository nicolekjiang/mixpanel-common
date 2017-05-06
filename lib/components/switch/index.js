import {Component} from 'panel';

import {registerMPElement} from  '../../util/register-element.js';

import css from './index.styl';
import template from './index.jade';

export default registerMPElement(`mp-switch`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        on: false,
        disabled: false,
      },
      helpers: {
        clickedSwitch: () => {
          if (!this.state.disabled) {
            this.setAttribute(`on`, !this.state.on);
          }
        },
      },
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    const disabled = this.hasAttribute(`disabled`) ? this.isAttributeEnabled(`disabled`) : this.state.disabled;
    const on = this.hasAttribute(`on`) ? this.isAttributeEnabled(`on`) : this.state.on;
    this.update({on, disabled});
  }

  attributeChangedCallback(attr) {
    super.attributeChangedCallback(...arguments);
    if (attr === `on` && this.initialized) {
      const on = this.isAttributeEnabled(`on`);
      this.dispatchEvent(new CustomEvent(`change`, {detail: {selected: on}}));
      this.update({on});
    }
  }
});
