import { Component } from 'panel';

import template from './modal.jade';

import css from './modal.styl';

document.registerElement('mp-modal', class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      helpers: {
        backdropClicked: () => {
          if (this.isAttributeEnabled('closeable')) {
            this.closeModal();
          }
        },
        closeClicked: () => {
          this.closeModal();
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

  closeModal() {
    const e = new Event('close');
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this.el.innerHTML = '';
    }
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    if (this.isAttributeEnabled('relative')) {
      this.el.querySelector('.mp-modal').classList.add('absolute');
    }
    this.maybeCloseOnEscape = (e) => {
      if (this.isAttributeEnabled('closeable') && e.keyCode === 27) {
        this.closeModal();
      }
    };
    document.body.addEventListener('keydown', this.maybeCloseOnEscape);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    document.body.removeEventListener('keydown', this.maybeCloseOnEscape);
  }
});
