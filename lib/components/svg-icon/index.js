import WebComponent from 'webcomponent';

import * as iconMap from 'glob:../../../assets/icons/*.svg';
import { registerMPComponent } from  '../registration.js';
import { mapKeys } from '../../util';

// NOTE: This component depends on styles that aren't packaged with it
// as there's no reliable, efficient way to do so.
// Option 1: Inject the CSS into the <head> tag
//   Problem: Styles don't get applied to svg-icons that happen to be in
//   ShadowDOM (like inside an mp-button component)
// Option 2: Use ShadowDOM for this component
//   Problem: This makes it a poor experience for styling the icons
//   from the "outside" which we'll often want to do for colors and
//   positioning.
// Option 3: Expect the styles to be handled separately. This is choice
//   we've made here. They come "for free" when you include "default" styles for mixpanel-common
//   which should happen for pretty much every page and every component.

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
      if (icon) {
        const markup = SVG_ICONS[icon];
        if (!markup) {
          throw new Error(`No svg-icon "${icon}" found.`);
        }
        this.innerHTML = markup;
      }
    }
  }
});

export {SVG_ICONS};
