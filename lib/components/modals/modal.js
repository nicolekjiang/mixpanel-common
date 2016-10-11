import { Component } from 'panel';

import '../registration.js';

import template from './modal.jade';

import css from './modal.styl';

import { onAnimationEnd, offAnimationEnd } from '../utils';

const STATE_OPEN = 'open';
const STATE_OPENING = 'opening';
const STATE_CLOSED = 'closed';
const STATE_CLOSING = 'closing';

class MPModal extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        state: STATE_CLOSED,
      },
      helpers: {
        backdropClicked: () => {
          if (this.isAttributeEnabled('closeable')) {
            this.close();
          }
        },
        closeClicked: () => {
          this.close();
        },
        getModalStyles: () => {
          const style = {};
          if (this.getAttribute('width')) {
            style.width = this.getAttribute('width');
          }
          return style;
        },
        getType: () => {
          return this.getAttribute('modal-type') || 'modal';
        },
      },
    };
  }

  close() {
    switch(this.state.state) {
      case STATE_CLOSED:
      case STATE_CLOSING:
        break;
      case STATE_OPENING:
        this.update({state: STATE_CLOSED});
        break;
      case STATE_OPEN:
        this._pendingAnimations = ['fadeModalOut'];
        if (this.config.helpers.getType() === 'modal') {
          this._pendingAnimations.push('fadeOverlayOut');
        }
        this.update({state: STATE_CLOSING});
        break;
    }
  }

  open() {
    switch(this.state.state) {
      case STATE_OPEN:
      case STATE_OPENING:
        break;
      case STATE_CLOSING:
        this.update({state: STATE_OPEN});
        break;
      case STATE_CLOSED:
        this._pendingAnimations = ['fadeModalIn'];
        if (this.config.helpers.getType() === 'modal') {
          this._pendingAnimations.push('fadeOverlayIn');
        }
        this.update({state: STATE_OPENING});
        break;
    }
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    // listen for escape keypress
    this.maybeCloseOnEscape = (e) => {
      if (this.isAttributeEnabled('closeable') && e.keyCode === 27) {
        this.close();
      }
    };
    document.body.addEventListener('keydown', this.maybeCloseOnEscape);

    // transition between states after animations complete
    this._onAnimationEnd = e => {
      if (this._pendingAnimations.length === 0) {
        return;
      }
      this._pendingAnimations = this._pendingAnimations.filter(anim => anim !== e.animationName);
      if (this._pendingAnimations.length > 0) {
        return;
      }
      switch(this.state.state) {
        case STATE_OPENING:
          this.update({state: STATE_OPEN});
          this.dispatchEvent(new CustomEvent('change', {detail: {state: STATE_OPEN}}));
          break;
        case STATE_CLOSING:
          this.update({state: STATE_CLOSED});
          this.dispatchEvent(new CustomEvent('change', {detail: {state: STATE_CLOSED}}));
          break;
      }
    };
    onAnimationEnd(this.el, this._onAnimationEnd);

    // open the modal if "closed" is explicitly set to false
    if (this.getAttribute('closed') === 'false') {
      this.open();
    }
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    document.body.removeEventListener('keydown', this.maybeCloseOnEscape);
    offAnimationEnd(this.el, this._onAnimationEnd);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(...arguments);
    if (this.initialized && name === 'closed') {
      if (newVal === 'true') {
        this.close();
      } else if (!newVal || newVal === 'false') {
        this.open();
      }
    }
  }
}

if (window['mp-common-registered-components']['mp-modal'] !== true) {
  document.registerElement('mp-modal', MPModal);
  window['mp-common-registered-components']['mp-modal'] = true;
}
