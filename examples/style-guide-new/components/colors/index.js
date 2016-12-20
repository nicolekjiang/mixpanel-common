import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

const COLOR_GROUPS = {
  'Mixpanel UI Colors': ['blue-900', 'blue-700', 'blue-500', 'mp-blue', 'blue-100', 'grey-900', 'grey-700', 'grey-500', 'grey-300', 'grey-200', 'grey-150', 'grey-100', 'grey-50', 'white', 'mp-red'],
  'Data Visualization': ['mp-navy', 'mp-ultramarine', 'mp-blue', 'mp-turquoise', 'mp-seafoam', 'mp-aquamarine', 'mp-orange', 'mp-yellow'],
};

const COLOR_LIBRARIES = {
  'MP-red': ['red-700', 'mp-red', 'red-300', 'red-200', 'red-100'],
  'MP-orange': ['orange-700', 'mp-orange', 'orange-300', 'orange-200', 'orange-100'],
  'MP-yellow': ['yellow-700', 'mp-yellow', 'yellow-300', 'yellow-200', 'yellow-100'],
  'MP-green': ['green-700', 'mp-green', 'green-300', 'green-200', 'green-100'],
  'MP-blue': ['blue-900', 'blue-700', 'blue-500', 'mp-blue', 'blue-100'],
  'MP-purple': ['purple-700', 'mp-purple', 'purple-300', 'purple-200', 'purple-100'],
};

document.registerElement('color-section', class extends Component {
  get config() {
    return {
      helpers: {
        sectionChange: e => {
          this.update({sectionFilter: e.currentTarget.dataset.filterName});
        },
        getColorGroups: () => COLOR_GROUPS,
        getColorLibraries: () => COLOR_LIBRARIES,
      },
      template,
    };
  }
});
