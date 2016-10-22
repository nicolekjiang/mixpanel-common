import WebComponent from 'webcomponent';

import * as iconMap from 'glob:../../../assets/icons/*.svg';
import { mapKeys, mapValues } from '../../util';

import './index.styl';

// dasherize icon names which were camelized by babel plugin
// TODO restore const
let SVG_ICONS = mapKeys(iconMap, k =>
  k.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '').toLowerCase()
);

// TMP hack to make SVGs stylable until design fixes
SVG_ICONS = mapValues(SVG_ICONS, v => v.replace(/fill=\"#\d+\"/g, ''));

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
