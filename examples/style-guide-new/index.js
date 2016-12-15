import 'babel-polyfill';

import 'webcomponents.js/webcomponents';

import { Component } from 'panel';

import '../../build/index';
import COLORS from '../../build/stylesheets/mixins/colors.json';
import { SVG_ICONS } from '../../build/components/svg-icon';

import template from './index.jade';
import './index.styl';

// COLOR GROUP SWATCHES
const COLOR_GROUPS = {
  'Mixpanel UI Colors': ['blue-900', 'blue-700', 'blue-500', 'mp-blue', 'blue-100', 'grey-900', 'grey-700', 'grey-500', 'grey-300', 'grey-200', 'grey-150', 'grey-100', 'grey-50', 'white', 'mp-red'],
  'Data Visualization': ['mp-navy', 'mp-ultramarine', 'mp-blue', 'mp-turquoise', 'mp-seafoam', 'mp-aquamarine', 'mp-orange', 'mp-yellow'],
};

// COLOR LIBRARIRES
const COLOR_LIBRARIES = {
  'MP-red': ['red-700', 'mp-red', 'red-300', 'red-200', 'red-100'],
  'MP-orange': ['orange-700', 'mp-orange', 'orange-300', 'orange-200', 'orange-100'],
  'MP-yellow': ['yellow-700', 'mp-yellow', 'yellow-300', 'yellow-200', 'yellow-100'],
  'MP-green': ['green-700', 'mp-green', 'green-300', 'green-200', 'green-100'],
  'MP-blue': ['blue-900', 'blue-700', 'blue-500', 'mp-blue', 'blue-100'],
  'MP-purple': ['purple-700', 'mp-purple', 'purple-300', 'purple-200', 'purple-100'],
};

// map the relative colors to their hex values for color groups
for (const group in COLOR_GROUPS) {
  const labels = COLOR_GROUPS[group];
  var colorMap = COLOR_GROUPS[group] = {};
  labels.forEach(label => {
    colorMap[label] = COLORS[label];
  });
}

// map the relative colors to their hex values for color libraries
for (const group in COLOR_LIBRARIES) {
  const labels = COLOR_LIBRARIES[group];
  var colorMap = COLOR_LIBRARIES[group] = {};
  labels.forEach(label => {
    colorMap[label] = COLORS[label];
  });
}

document.registerElement('style-guide', class extends Component {
  get config() {
    return {
      defaultState: {
        blueToggleValue: 'option1',
        menuOpen: false,
        COLORS,
        COLOR_GROUPS,
        COLOR_LIBRARIES,
        SVG_ICONS,
        inputGroupSaving: false,
        open: {},
      },
      helpers: {
        blueToggleChanged: ev => this.update({blueToggleValue: ev.detail.selected}),
        closeModal: key => {
          this.state.open[key] = false;
          this.update();
        },
        openModal: key => {
          this.state.open[key] = true;
          this.update();
        },
        handleModalChange: (key, state) => {
          this.state.open[key] = state === 'open';
          this.update();
        },
        handleNamerChange: e => {
          console.log('mp-input-group value changed to: ', e.target.value);
        },
        handleNamerSubmit: () => {
          this.update({inputGroupSaving: true});
          setTimeout(() => {
            this.update({inputGroupSaving: false});
            alert('Saved!');
          }, 2000);
        },
        toggleMenu: () => {
          const menuOpen = !this.state.menuOpen;
          this.update({menuOpen});
        },
      },
      template,
    };
  }
});

import '../../examples/style-guide-new/nav-menu';