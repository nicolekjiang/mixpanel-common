import WebComponent from 'webcomponent';

import * as iconMap from 'glob:../../../assets/icons/*.svg';
import { mapKeys } from '../../util';

import './index.styl';

// dasherize icon names which were camelized by babel plugin
const SVG_ICONS = mapKeys(iconMap, k =>
  k.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '').toLowerCase()
);

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

export {SVG_ICONS};
