import WebComponent from 'webcomponent';

import css from './buttons.styl';

document.registerElement('mp-button', class MPButton extends WebComponent {
  attachedCallback() {
    this.root = this.createShadowRoot();
    this.main = document.createElement('div');
    this.main.className = this.className;
    this.main.classList.add('mp-button');
    this.getAttribute('type').split(' ').forEach(type => this.main.classList.add(type));
    this.render();
  }

  render() {
    this.root.innerHTML = `<style>${css}</style>`;
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
