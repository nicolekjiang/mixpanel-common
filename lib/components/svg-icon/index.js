import WebComponent from 'webcomponent';

import './index.styl';

const SVG_ICONS = {};
// const svgIconContext = require.context(`mixpanel-common/assets/icons`);
// svgIconContext.keys().forEach(filename => {
//   const iconName = filename.match(/([^\/]+)\.svg$/)[1];
//   SVG_ICONS[iconName] = svgIconContext(filename);
// });
import svgTest from '../../../assets/icons/bar.svg';
console.log('svg:', svgTest);

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
