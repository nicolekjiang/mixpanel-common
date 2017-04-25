import { Component } from 'panel';

import { registerMPElement } from '../../util/register-element.js';

import template from './index.jade';
import css from './index.styl';

const GLOBAL_MIN_WIDTH = 90;
const SIZER_PROPS = [
  `border`,
  `fontFamily`,
  `fontSize`,
  `fontWeight`,
  `height`,
  `letterSpacing`,
  `padding`,
  `whiteSpace`,
];

export default registerMPElement(`mp-edit-input`, class extends Component {
  get config() {
    return {
      template,
      updateSync: true,
      defaultState: {
        value: ``,
        pendingText: ``,
        inputWidth: GLOBAL_MIN_WIDTH,
      },
      helpers: {
        inserted: vnode => requestAnimationFrame(() => {
          if (this.isAttributeEnabled(`autofocus`)) {
            vnode.elm.focus();
          }
        }),
        blurredInput: () => {
          if  (this.getAttribute(`icon`)) {
            this.sizer.style.paddingLeft = null;
            this.resize();
          }
          if (this.state.pendingText) {
            this.update({value: this.state.pendingText});
          }
          this.setMinimumWidth(this.getTextWidth(this.state.value));
        },
        focusedInput: () => {
          if  (this.getAttribute(`icon`)) {
            this.sizer.style.paddingLeft = `24px`;
            this.resize();
          }
          this.update({pendingText: ``});
          this.setMinimumWidth(this.getTextWidth(this.state.value));
        },
        updatedInput: ev => {
          this.update({pendingText: ev.target.value});
          this.resize();
        },
      },
      useShadowDom: true,
      css,
    };
  }

  createdCallback() {
    super.createdCallback(...arguments);
    this.minimumWidth = this.defaultMinWidth;
  }

  attachedCallback() {
    if (!this.initialized) {
      super.attachedCallback(...arguments);
      this.removeSizer();
      this.resize();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(...arguments);
    if (name === `value`) {
      this.update({value: newValue});
    }
  }

  detachedCallback() {
    this.removeSizer();
  }

  removeSizer() {
    if (this.sizer) {
      this.sizer.remove();
      this.sizer = null;
    }
  }

  focus() {
    const input = this.querySelector(`input`);
    if (input) {
      input.focus();
    }
  }

  getTextWidth(text) {
    if (!this.sizer) {
      this.sizer = document.createElement(`div`);

      const tmpInput = document.createElement(`input`);
      tmpInput.type = `text`;
      this.el.querySelector(`.resize-input`).appendChild(tmpInput);
      const inputStyle = getComputedStyle(tmpInput);
      for (let prop of SIZER_PROPS) {
        this.sizer.style[prop] = inputStyle[prop];
      }
      tmpInput.remove();

      this.sizer.style.display = `inline-block`;
      this.sizer.style.position = `absolute`;
      this.sizer.style.top = `-10000px`;
      this.sizer.style.left = `-10000px`;
      this.sizer.style.visibility = `hidden`;

      this.el.appendChild(this.sizer);
    }
    text = text || ``;
    while (text.endsWith(` `)) {
      text = `&nbsp;${text.slice(0, text.length - 1)}`;
    }
    this.sizer.innerHTML = text.replace(` `, `&nbsp;`);

    // allow 1 decimal precision - some text values will be X.5px wide and will jitter if the .5 is rounded off
    return Math.round(this.sizer.getBoundingClientRect().width * 10) / 10;
  }

  resize() {
    const text = this.state.pendingText || this.state.value;
    this.update({inputWidth:  Math.max(this.minimumWidth, this.getTextWidth(text))});
  }

  setMinimumWidth(newMin) {
    if (newMin !== this.minimumWidth) {
      this.minimumWidth = Math.max(newMin, this.defaultMinWidth);
      this.resize();
    }
  }

  get value() {
    return this.state.value;
  }

  get defaultMinWidth() {
    const minWidth = Number(this.getAttribute(`min-width`));
    return Number.isInteger(minWidth) ? minWidth : GLOBAL_MIN_WIDTH;
  }

  set value(value) {
    this.update({value});
    this.resize();
  }
});

