import { Component } from 'panel';

import template from './index.jade';
import './index.styl';

const COLOR_GROUPS = {
  'Mixpanel UI Colors': ['blue-900', 'blue-700', 'blue-500', 'mp-blue', 'blue-100', 'grey-900', 'grey-700', 'grey-500', 'grey-300', 'grey-200', 'grey-150', 'grey-100', 'grey-50', 'white', 'mp-red'],
  'Data Visualization': ['mp-navy', 'mp-ultramarine', 'mp-blue', 'mp-turquoise', 'mp-seafoam', 'mp-aquamarine', 'mp-orange', 'mp-yellow'],
};

const COLOR_LIBRARIES = {
  'mp-red': ['red-700', 'mp-red', 'red-300', 'red-200', 'red-100'],
  'mp-orange': ['orange-700', 'mp-orange', 'orange-300', 'orange-200', 'orange-100'],
  'mp-yellow': ['yellow-700', 'mp-yellow', 'yellow-300', 'yellow-200', 'yellow-100'],
  'mp-green': ['green-700', 'mp-green', 'green-300', 'green-200', 'green-100'],
  'mp-blue': ['blue-900', 'blue-700', 'blue-500', 'mp-blue', 'blue-100'],
  'mp-purple': ['purple-700', 'mp-purple', 'purple-300', 'purple-200', 'purple-100'],
};

document.registerElement('color-section', class extends Component {
  get config() {
    return {
      helpers: {
        getColorGroups: () => COLOR_GROUPS,
        getColorLibraries: () => COLOR_LIBRARIES,
        hideSectionOnSearch: sectionId => {
          const sectionKeywords = sectionId.split('-').join(' ');
          if (this.state.sectionOpen != 'search' || sectionKeywords.includes(this.state.searchTerm)) {
            return false
          }
          return true;
        },
        showAllColors: (colorType, colors = null) => {
          let showAll = true;
          if (this.state.sectionOpen == 'search') {
            if (colorType == 'colorGroup') {
              colors.forEach(color => {
                if (color.includes(this.state.searchTerm) ||
                    this.state.COLORS[color].includes(this.state.searchTerm)) {
                  showAll = false;
                }
              });
            } else if (colorType == 'colorLibrary') {
              const colorLibrayKeys = Object.keys(COLOR_LIBRARIES);
              colorLibrayKeys.forEach(colorCategory => {
                COLOR_LIBRARIES[colorCategory].forEach(color => {
                  if (color.includes(this.state.searchTerm) ||
                      this.state.COLORS[color].includes(this.state.searchTerm)) {
                    showAll = false;
                  }
                })
              })
            }
          }
          return showAll
        },
        showColorLibraries: colorGroup => {
          let show = false;
          const colors = COLOR_LIBRARIES[colorGroup];
          if (colorGroup.includes(this.state.searchTerm)) {
            show = true;
          }
          colors.forEach(color => {
            if (color.includes(this.state.searchTerm)) {
              show = true;
            }
          })
          return show;
        }
      },
      template,
    };
  }
});
