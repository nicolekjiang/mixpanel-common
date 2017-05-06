import 'babel-polyfill';

import 'webcomponents.js/webcomponents';

import { Component } from 'panel';

import '../../build/index';
import COLORS from '../../build/stylesheets/mixins/colors.json';
import { SVG_ICONS } from '../../build/components/svg-icon';
import searchTerms from './search-terms.json'

import './components/buttons';
import './components/colors';
import './components/components';
import './components/iconography';
import './components/nav-bar';
import './components/search'
import './components/typography';
import './components/widgets';

import template from './index.jade';
import './index.styl';

document.registerElement('style-guide', class extends Component {
  get config() {
    return {
      defaultState: {
        COLORS,
        SVG_ICONS,
        sectionOpen: 'colors',
        subSectionOpen: null,
        sectionFilter: null,
        open: {
          alert: true,
          confirm: false,
          dropMenu: false,
          modal: false,
          tagSelector: true,
          tutorialTooltip: {
            top: true,
          },
          upsell: true,
        },
        searchTerm: null,
        searchSections: [],
        sectionFilter: null,
        sectionOpen: 'search',
        subSectionOpen: null,
        SVG_ICONS,
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
    }
  }

  matchSearchTerms(searchTerm) {
    if (searchTerm) {
      const sections = Object.keys(searchTerms);
      const searchSections = [];
      for (let x = 0; x < sections.length; x++) {
        let sectionName = sections[x]
        for (let i = 0; i < searchTerms[sectionName].length; i++) {
          if (searchTerms[sectionName][i].includes(searchTerm)) {
            searchSections.push(sectionName);
            break;
          }
        }
      }
      this.update({searchSections});
    } else {
      this.update({searchSections: []});
    }
  }
});
