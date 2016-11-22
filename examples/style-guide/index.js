import 'babel-polyfill';

import 'webcomponents.js/webcomponents';

import { Component } from 'panel';

import '../../build/index';
import COLORS from '../../stylesheets/colors.json';
import { SVG_ICONS } from '../../build/components/svg-icon';

import template from './index.jade';
import './index.styl';


document.registerElement('style-guide', class extends Component {
  get config() {
    return {
      defaultState: {
        blueToggleValue: 'option1',
        menuOpen: false,

        COLORS,
        SVG_ICONS,
        inputGroupSaving: false,
      },
      helpers: {
        blueToggleChanged: ev => this.update({blueToggleValue: ev.detail.selected}),
        closeModal: selector => this.el.querySelector(selector).close(),
        openModal: selector => {
          this.el.querySelector(selector).open();
          return false;
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
        }
      },
      template,
    };
  }
});
