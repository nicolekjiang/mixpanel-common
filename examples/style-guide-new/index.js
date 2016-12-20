import 'babel-polyfill';

import 'webcomponents.js/webcomponents';

import { Component } from 'panel';

import '../../build/index';
import COLORS from '../../build/stylesheets/mixins/colors.json';
import { SVG_ICONS } from '../../build/components/svg-icon';

import './components/nav-bar';
import './components/colors';

import template from './index.jade';
import './index.styl';

document.registerElement('style-guide', class extends Component {
  get config() {
    return {
      defaultState: {
        COLORS,
        SVG_ICONS,
        sectionOpen: null,
        subSectionOpen: null,
        sectionFilter: null,
      },
      helpers: {
        navSectionChange: e => {
          let navSectionOpen = e.currentTarget.dataset.sectionName;
          if (navSectionOpen === this.state.navSectionOpen) {
            navSectionOpen = null;
          }
          this.update({navSectionOpen});
        }
      },
      template,
    };
  }
});
