import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';

import css from './index.styl';

import { onAnimationEnd, offAnimationEnd } from '../../util/dom';

const VISIBILITY_OPEN = `open`;
const VISIBILITY_OPENING = `opening`;
const VISIBILITY_CLOSED = `closed`;
const VISIBILITY_CLOSING = `closing`;

export default registerMPElement(`mp-modal`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        visibility: VISIBILITY_CLOSED,
      },
      helpers: {
        backdropClicked: () => {
          if (this.isAttributeEnabled(`closeable`)) {
            this.close();
          }
        },
        closeClicked: () => {
          this.close();
        },
        getType: () => {
          return this.getAttribute(`modal-type`) || `modal`;
        },
        isCentered: () => {
          if (this.isAttributeEnabled('not-centered')) {
            if (this.helpers.getType() === `modal` || this.isAttributeEnabled(`not-fullscreen`)) {
              throw new Error(`not-centered=true is not valid when modal-type=modal or not-fullscreen=true`)
            }
            return false;
          } else {
            return true;
          }
        },
      },
    };
  }

  close() {
    switch(this.state.visibility) {
      case VISIBILITY_CLOSED:
      case VISIBILITY_CLOSING:
        break;
      case VISIBILITY_OPENING:
        this.update({visibility: VISIBILITY_CLOSED});
        break;
      case VISIBILITY_OPEN:
        this._pendingAnimations = [`fadeModalOut`];
        if (this.config.helpers.getType() === `modal`) {
          this._pendingAnimations.push(`fadeOverlayOut`);
        }
        this.update({visibility: VISIBILITY_CLOSING});
        break;
    }
  }

  open() {
    switch(this.state.visibility) {
      case VISIBILITY_OPEN:
      case VISIBILITY_OPENING:
        break;
      case VISIBILITY_CLOSING:
        this.update({visibility: VISIBILITY_OPEN});
        break;
      case VISIBILITY_CLOSED:
        this._pendingAnimations = [`fadeModalIn`];
        if (this.config.helpers.getType() === `modal`) {
          this._pendingAnimations.push(`fadeOverlayIn`);
        }
        this.update({visibility: VISIBILITY_OPENING});
        break;
    }
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    // listen for escape keypress
    this.maybeCloseOnEscape = e => {
      if (this.isAttributeEnabled(`closeable`) && e.keyCode === 27) {
        this.close();
      }
    };
    document.body.addEventListener(`keydown`, this.maybeCloseOnEscape);

    // transition between states after animations complete
    this._onAnimationEnd = e => {
      if (this._pendingAnimations.length === 0) {
        return;
      }
      this._pendingAnimations = this._pendingAnimations.filter(anim => anim !== e.animationName);
      if (this._pendingAnimations.length > 0) {
        return;
      }
      switch(this.state.visibility) {
        case VISIBILITY_OPENING:
          this.update({visibility: VISIBILITY_OPEN});
          this.dispatchEvent(new CustomEvent(`change`, {detail: {state: VISIBILITY_OPEN}}));
          break;
        case VISIBILITY_CLOSING:
          this.update({visibility: VISIBILITY_CLOSED});
          this.dispatchEvent(new CustomEvent(`change`, {detail: {state: VISIBILITY_CLOSED}}));
          break;
      }
    };
    onAnimationEnd(this.el, this._onAnimationEnd);

    if (this.isAttributeEnabled(`open`)) {
      this.open();
    }
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    document.body.removeEventListener(`keydown`, this.maybeCloseOnEscape);
    offAnimationEnd(this.el, this._onAnimationEnd);
  }

  attributeChangedCallback(name) {
    super.attributeChangedCallback(...arguments);
    if (this.initialized && name === `open`) {
      if (this.isAttributeEnabled(`open`)) {
        this.open();
      } else {
        this.close();
      }
    }
  }
});
