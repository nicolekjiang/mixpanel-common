import WebComponent from 'webcomponent';

import './index.styl';

import * as SVG_ICONS from 'glob:../../../assets/icons/*.svg';

document.registerElement('svg-icon', class extends WebComponent {
  attachedCallback() {
    this.render();
    this._initialized = true;
  }

  attributeChangedCallback() {
    if (this._initialized) {
      this.render();
    }
  }

  render() {
    this.innerHTML = SVG_ICONS[this.getAttribute('icon')];
  }
});
