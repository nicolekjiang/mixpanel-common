import WebComponent from 'webcomponent';

import css from './buttons.styl';

document.registerElement('mp-button', class MPButton extends WebComponent {
  createdCallback() {
    this.createShadowRoot();
    this.main = document.createElement('div');
    this.attached = false;
  }

  attachedCallback() {
    this.attached = true;
    this.main.className = this.className;
    this.main.classList.add('mp-button');
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `<style>${css}</style>`;
    this.main.innerHTML = `<span class="text"><content></content></span>`;
    if (this.isAttributeEnabled('disabled')) {
      this.main.setAttribute('disabled', true);
    } else {
      this.main.removeAttribute('disabled');
    }
    this.shadowRoot.appendChild(this.main);
  }

  attributeChangedCallback() {
    if (this.attached) {
      this.render();
    }
  }
});
