import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';
import { clickWasOutside } from  '../../util/dom.js';

import { onAnimationEnd, offAnimationEnd } from '../../util/dom';

import template from './index.jade';
import css from './index.styl';

const VISIBILITY_OPEN = `open`;
const VISIBILITY_OPENING = `opening`;
const VISIBILITY_CLOSED = `closed`;
const VISIBILITY_CLOSING = `closing`;

export default registerMPElement(`mp-drop-menu`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,

      defaultState: {
        visibility: VISIBILITY_CLOSED,
      },
    };
  }

  _closeMenu() {
    switch(this.state.visibility) {
      case VISIBILITY_CLOSED:
      case VISIBILITY_CLOSING:
        break;
      case VISIBILITY_OPENING:
        this.update({visibility: VISIBILITY_CLOSED});
        break;
      case VISIBILITY_OPEN:
        this.update({visibility: VISIBILITY_CLOSING});
        break;
    }
  }

  _openMenu() {
    switch(this.state.visibility) {
      case VISIBILITY_OPEN:
      case VISIBILITY_OPENING:
        break;
      case VISIBILITY_CLOSING:
        this.update({visibility: VISIBILITY_OPEN});
        break;
      case VISIBILITY_CLOSED:
        this.update({visibility: VISIBILITY_OPENING});
        break;
    }
  }

  attributeChangedCallback(attr) {
    super.attributeChangedCallback(...arguments);
    if (attr === `open` && this.initialized) {
      if (this.isAttributeEnabled(`open`)) {
        this._openMenu();
      } else {
        this._closeMenu();
      }
    }
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    if (this.isAttributeEnabled(`open`)) {
      this._openMenu();
    }
    this._onAnimationEnd = () => {
      switch(this.state.visibility) {
        case VISIBILITY_OPENING:
          this.update({visibility: VISIBILITY_OPEN});
          document.body.addEventListener(`keydown`, this.maybeCloseOnEscape);
          document.addEventListener(`click`, this.clickOutsideListener);
          this.dispatchEvent(new CustomEvent(`change`, {detail: {state: this.state.visibility}}));
          break;
        case VISIBILITY_CLOSING:
          this.update({visibility: VISIBILITY_CLOSED});
          document.body.removeEventListener(`keydown`, this.maybeCloseOnEscape);
          document.removeEventListener(`click`, this.clickOutsideListener);
          this.dispatchEvent(new CustomEvent(`change`, {detail: {state: this.state.visibility}}));
          break;
      }
    };
    onAnimationEnd(this.el, this._onAnimationEnd);

    // close the menu when escape is pressed
    this.maybeCloseOnEscape = e => {
      if (e.keyCode === 27) {
        this._closeMenu();
      }
    };

    // close when the user clicks outside of the menu
    this.clickOutsideListener = e => {
      if (this.isAttributeEnabled(`open`) && clickWasOutside(e, this)) {
        this._closeMenu();
      }
    };
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    offAnimationEnd(this.el, this._onAnimationEnd);
    document.body.removeEventListener(`keydown`, this.maybeCloseOnEscape);
    document.removeEventListener(`click`, this.clickOutsideListener);
  }
});
