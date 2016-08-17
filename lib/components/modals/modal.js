import { Component } from 'panel';

import template from './modal.jade';

import css from './modal.styl';

class MPModal extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
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
    return new Promise((resolve) => {
      Array.from(this.el.querySelectorAll('.mp-modal-backdrop, .mp-modal-main'))
        .forEach(el => el.classList.add('mp-modal-closing'));
      setTimeout(() => {
        this.dispatchEvent(new Event('close'));
        resolve();
      }, 700);
    });
  }

  open() {
    Array.from(this.el.querySelectorAll('.mp-modal-backdrop, .mp-modal-main'))
      .forEach(el => el.classList.remove('mp-modal-closing'));
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    this.maybeCloseOnEscape = (e) => {
      if (this.isAttributeEnabled('closeable') && e.keyCode === 27) {
        this.close();
      }
    };
    document.body.addEventListener('keydown', this.maybeCloseOnEscape);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    document.body.removeEventListener('keydown', this.maybeCloseOnEscape);
  }
}

if (window['mp-common-registered-components']['mp-modal'] !== true) {
  document.registerElement('mp-modal', MPModal);
  window['mp-common-registered-components']['mp-modal'] = true;
}
