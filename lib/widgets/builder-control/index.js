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

/* public api: label, value, min-width, type */
export default registerMPElement(`mp-builder-control`, class extends Component {
  get config() {
    return {
      template,
      updateSync: true,
      helpers: {
        inserted: vnode => requestAnimationFrame(() => {
          vnode.elm.focus();
        }),
        labelParts: () => {
          const label = this.getJSONAttribute(`label`);
          if (!label) {
            return [this.getAttribute(`value`)];
          } else if (label.constructor === Array) {
            return label;
          } else {
            return [label];
          }
        },
        labelClicked: () => {
          this.dispatchEvent(new CustomEvent(`label-click`));
        },
        blurredInput: e => {
          if (this.getAttribute(`icon`)) {
            this.sizer.style.paddingLeft = null;
            this.resize();
          }
          this.dispatchEvent(new CustomEvent(`input-blur`, {detail: {value: e.target.value}}));
        },
        focusedInput: () => {
          if (this.getAttribute(`icon`)) {
            this.sizer.style.paddingLeft = `24px`;
            this.resize();
          }
          this.setMinimumWidth(this.getTextWidth(this.getAttribute(`value`)));
        },
        updatedInput: ev => {
          this.pendingText = ev.target.value;
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
      this.setMinimumWidth(this.getTextWidth(this.getAttribute(`value`)));
      this.removeSizer();
      this.resize();
    }
  }

  detachedCallback() {
    this.removeSizer();
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(...arguments);
    if (attr === `value`) {
      this.setMinimumWidth(this.getTextWidth(newVal));
    }
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

    return Math.round(this.sizer.getBoundingClientRect().width);
  }

  resize() {
    const text = this.pendingText || this.getAttribute(`value`);
    this.update({inputWidth: Math.max(this.minimumWidth, this.getTextWidth(text))});
  }

  setMinimumWidth(newMin) {
    if (newMin !== this.minimumWidth) {
      this.minimumWidth = Math.max(newMin, this.defaultMinWidth);
      this.resize();
    }
  }

  get defaultMinWidth() {
    const minWidth = Number(this.getAttribute(`min-width`));
    return Number.isInteger(minWidth) ? minWidth : GLOBAL_MIN_WIDTH;
  }

});

