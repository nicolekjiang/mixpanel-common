import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import { onAnimationEnd, offAnimationEnd } from '../utils';

import template from './index.jade';
import css from './index.styl';

const VISIBILITY_OPEN = 'open';
const VISIBILITY_OPENING = 'opening';
const VISIBILITY_CLOSED = 'closed';
const VISIBILITY_CLOSING = 'closing';

registerMPElement('mp-drop-menu', class extends Component {
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

  closeMenu() {
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

  openMenu() {
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
    if (attr === 'open' && this.initialized) {
      if (this.isAttributeEnabled('open')) {
        this.openMenu();
      } else {
        this.closeMenu();
      }
    }
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    if (this.isAttributeEnabled('open')) { // open the menu if it's not explicitly closed
      this.openMenu();
    }
    this._onAnimationEnd = () => {
      switch(this.state.visibility) {
        case VISIBILITY_OPENING:
          this.update({visibility: VISIBILITY_OPEN});
          this.dispatchEvent(new CustomEvent('change', {detail: {state: this.state.visibility}}));
          break;
        case VISIBILITY_CLOSING:
          this.update({visibility: VISIBILITY_CLOSED});
          this.dispatchEvent(new CustomEvent('change', {detail: {state: this.state.visibility}}));
          break;
      }
    };
    onAnimationEnd(this.el, this._onAnimationEnd);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    offAnimationEnd(this.el, this._onAnimationEnd);
  }
});
