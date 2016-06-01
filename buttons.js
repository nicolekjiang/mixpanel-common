import WebComponent from 'webcomponent';

import css from './buttons.styl';

document.registerElement('mpc-button', class MPCButton extends WebComponent {
  createdCallback() {
    this.root = this.createShadowRoot();
    this.main = document.createElement('div');
    this.main.classList.add('mpc-button');
    this.main.classList.add(this.getAttribute('type'));
  }

  attachedCallback() {
    this.render();
  }

  render() {
    this.root.innerHTML = `<style>${css[0][1]}</style>`;
    this.main.innerHTML = `<span class="${this.getAttribute('type')}-text"><content></content></span>`;
    if (this.isAttributeEnabled('disabled')) {
      this.main.setAttribute('disabled', true);
    } else {
      this.main.removeAttribute('disabled');
    }
    this.root.appendChild(this.main);
  }

  attributeChangedCallback() {
    this.render();
  }
});
