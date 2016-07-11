import { Component } from 'panel';

import alertTemplate from './alert-modal.jade';

import modalTemplate from './modal.jade';

import css from './modal.styl';

document.registerElement('mp-modal', class extends Component {
  get config() {
    return {
      css,
      template: this.isAttributeEnabled('alert') ? alertTemplate : modalTemplate,
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
      const e = new Event('close');
      this.dispatchEvent(e);
      if (e.defaultPrevented) {
        resolve();
      } else {
        Array.from(this.el.querySelectorAll('.backdrop, .modal'))
          .forEach(el => el.classList.add('closing'));
        setTimeout(() => {
          this.style.display = 'none';
          resolve();
        }, 700);
      }
    });
  }

  open() {
    const e = new Event('open');
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      Array.from(this.el.querySelectorAll('.backdrop, .modal'))
        .forEach(el => el.classList.remove('closing'));
      this.style.display = 'block';
    }
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    if (this.isAttributeEnabled('alert')) {
      this.el.querySelector('.mp-modal').classList.add('alert');
    }
    if (this.isAttributeEnabled('relative')) {
      this.el.querySelector('.mp-modal').classList.add('absolute');
    }
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
});
