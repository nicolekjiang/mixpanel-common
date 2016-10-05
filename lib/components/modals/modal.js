import { Component } from 'panel';

import template from './modal.jade';

import css from './modal.styl';

const ANIMATION_START_EVENTS = ['webkitAnimationStart', 'animationstart', 'oAnimationStart', 'MSAnimationStart'];
const ANIMATION_END_EVENTS = ['webkitAnimationEnd', 'animationend', 'oAnimationEnd', 'MSAnimationEnd'];

const onAnimationStart = (el, callback) => {
  ANIMATION_START_EVENTS.forEach(e => el.addEventListener(e, callback));
};

const offAnimationStart = (el, callback) => {
  ANIMATION_START_EVENTS.forEach(e => el.removeEventListener(e, callback));
};

const onAnimationEnd = (el, callback) => {
  ANIMATION_END_EVENTS.forEach(e => el.addEventListener(e, callback));
};

const offAnimationEnd = (el, callback) => {
  ANIMATION_END_EVENTS.forEach(e => el.removeEventListener(e, callback));
};


class MPModal extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        closed: true,
        closing: false,
        opening: false,
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
    if (this.state.closed) {
      return Promise.resolve();
    } else if (this.state.closing) {
      return this._closingPromise;
    } else {
      this._closingPromise = new Promise(resolve => {
        this.addEventListener('change', e => {
          if (e.detail.state === 'closed') {
            resolve();
          }
        });
        this.update({opening: false, closing: true});
      });
      return this._closingPromise;
    }
  }

  open() {
    if (this.state.closed) {
      this.update({opening: true, closed: false});
    }
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    this._attached = true;

    // listen for escape keypress
    this.maybeCloseOnEscape = (e) => {
      if (this.isAttributeEnabled('closeable') && e.keyCode === 27) {
        this.close();
      }
    };
    document.body.addEventListener('keydown', this.maybeCloseOnEscape);

    // use animation events to determine when the modal is done transitioning
    // between open or closed states
    this._animationCount = 0;
    this._onAnimationStart = () => this._animationCount++;
    this._onAnimationEnd = () => {
      this._animationCount--;
      if (this._animationCount === 0) {
        if (this.state.opening) {
          this.dispatchEvent(new CustomEvent('change', {detail: {state: 'open'}}));
          this.update({opening: false});
        } else if (this.state.closing) {
          this.dispatchEvent(new CustomEvent('change', {detail: {state: 'closed'}}));
          this.update({closing: false, closed: true});
        }
      }
    };
    onAnimationStart(this.el, this._onAnimationStart);
    onAnimationEnd(this.el, this._onAnimationEnd);

    // open the modal if "closed" is explicitly set to false
    if (this.getAttribute('closed') === 'false') {
      this.open();
    }
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    document.body.removeEventListener('keydown', this.maybeCloseOnEscape);
    offAnimationStart(this.el, this._onAnimationStart);
    offAnimationEnd(this.el, this._onAnimationEnd);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(...arguments);
    if (this._attached && name === 'closed') {
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
