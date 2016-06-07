import WebComponent from 'webcomponent';

import css from './modals.styl';

document.registerElement('mp-modal', class MPModal extends WebComponent {
  attachedCallback() {
    this.root = this.createShadowRoot();

    this.main = document.createElement('div');
    this.main.className = this.className;
    this.main.classList.add('mp-modal');

    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    this.main.appendChild(backdrop);

    const top = document.createElement('div');
    top.className = 'top-container';
    top.appendChild(this.getElementsByClassName('mp-modal-title')[0]);
    top.appendChild(this.getElementsByClassName('mp-modal-subtitle')[0]);

    const modal = document.createElement('div');
    modal.className = 'modal-container';
    modal.appendChild(top);
    modal.appendChild(this.getElementsByTagName('mp-button')[0]);
    this.main.appendChild(modal);

    this.render();
  }

  render() {
    this.root.innerHTML = `<style>${css}</style>`;
    this.root.appendChild(this.main);
  }
});
