import WebComponent from 'webcomponent';

import css from './modals.styl';

document.registerElement('mp-modal', class MPModal extends WebComponent {
  createdCallback() {
    this.root = this.createShadowRoot();
    this.main = document.createElement('div');
    this.main.className = 'mp-modal';
    const top = document.createElement('div');
    top.className = 'top-container';
    top.appendChild(this.getElementsByClassName('mp-modal-title')[0]);
    top.appendChild(this.getElementsByClassName('mp-modal-subtitle')[0]);
    this.main.appendChild(top);
    this.main.appendChild(this.getElementsByTagName('mp-button')[0]);
  }

  attachedCallback() {
    this.render();
  }

  render() {
    this.root.innerHTML = `<style>${css[0][1]}</style>`;
    this.root.appendChild(this.main);
  }
});
