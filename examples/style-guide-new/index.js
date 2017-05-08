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
        previousSectionOpen: null,
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
        searchTermPrompt: null,
        searchTerm: null,
        searchSections: [],
        sectionFilter: null,
        sectionOpen: 'colors',
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
      const searchTermList = searchTerm.split(' ');
      const sections = Object.keys(searchTerms);
      const searchSections = [];
      for (let x = 0; x < sections.length; x++) {
        let sectionName = sections[x]
        let match = true;
        for (let z = 0; z < searchTermList.length; z++) {
          let termMatch = false;
          for (let y = 0; y < searchTerms[sectionName].length; y++) {
            if (searchTerms[sectionName][y].includes(searchTermList[z])) {
              termMatch = true;
              break;
            }
          }
          if (!termMatch) {
            match = false;
            break;
          }
        }
        if (match) {
          searchSections.push(sectionName);
        }
      }
      this.update({searchSections});
    } else {
      this.update({searchSections: []});
    }
  }

  isCharacterKeyPress(e) {
    if ((65 <= e.which && e.which <= 90) || (97 <= e.which && e.which <= 122)) {
      return true
    }
    return false;
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    this.enterSearchMode = e => {
      const sectionOpen = this.state.sectionOpen;
      this.update({sectionOpen: 'search'});
      if (sectionOpen != 'search') {
        this.update({previousSectionOpen: sectionOpen});
        if (this.isCharacterKeyPress(e)) {
          this.update({searchTermPrompt: e.key.toUpperCase()});
        }
      }
    }
    document.body.addEventListener(`keypress`, this.enterSearchMode);
  }
});
