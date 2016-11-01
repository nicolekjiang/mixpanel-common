import WebComponent from 'webcomponent';

import * as iconMap from 'glob:../../../assets/icons/*.svg';
import { registerMPComponent } from  '../registration.js';
import { mapKeys } from '../../util';

import './index.styl';

// dasherize icon names which were camelized by babel plugin
const SVG_ICONS = mapKeys(iconMap, k =>
  k.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '').toLowerCase()
);

registerMPComponent('svg-icon', class extends WebComponent {
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
    if (this.isAttributeEnabled('empty')) {
      this.innerHTML = '';
    } else {
      const icon = this.getAttribute('icon');
      const markup = SVG_ICONS[icon];
      if (!markup) {
        throw new Error(`No svg-icon "${icon}" found.`);
      }
      this.innerHTML = markup;
    }
  }
});

export {SVG_ICONS};
