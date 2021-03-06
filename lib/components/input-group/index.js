import {Component} from 'panel';

import {registerMPElement} from  '../../util/register-element.js';

import template from './index.jade';

import css from './index.styl';

export default registerMPElement(`mp-input-group`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        value: ``,
      },
      helpers: {
        setValue: e => {
          this.update({value: e.target.value});
          this.dispatchEvent(new Event(`change`));
        },
        submitIfEnter: e => {
          if (e.keyCode === 13) {
            this._submitIfValid();
          }
        },
        submit: () => {
          this._submitIfValid();
        },
      },
    };
  }

  get value() {
    return this.state.value;
  }

  set value(value) {
    this.update({value});
  }

  focus() {
    return this.el.querySelector(`input`).focus();
  }

  _submitIfValid() {
    if (this.state.value && !this.isAttributeEnabled(`busy`)) {
      this.dispatchEvent(new Event(`submit`));
    }
  }

  _updateValueFromAttr() {
    this.update({value: this.getAttribute(`value`)});
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    if (this.getAttribute(`value`)) {
      this._updateValueFromAttr();
    }
  }

  attributeChangedCallback(name) {
    super.attributeChangedCallback(...arguments);
    if (this.initialized && name === `value`) {
      this._updateValueFromAttr();
    }
  }
});
