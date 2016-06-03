import WebComponent from 'webcomponent';

import css from './buttons.styl';

document.registerElement('mp-button', class MPButton extends WebComponent {
  createdCallback() {
    this.root = this.createShadowRoot();
    this.main = document.createElement('div');
    this.main.classList.add('mp-button');
    this.getAttribute('type').split(' ').forEach(type => this.main.classList.add(type));
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
