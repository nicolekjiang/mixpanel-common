import 'babel-polyfill';

import 'webcomponents.js/webcomponents';

import { Component } from 'panel';

import '../../build/index';
import COLORS from '../../build/stylesheets/mixins/colors.json';
import { SVG_ICONS } from '../../build/components/svg-icon';
import bookmarks from './bookmark-data.json';

import template from './index.jade';
import './index.styl';

document.registerElement('style-guide', class extends Component {
  get config() {
    return {
      defaultState: {
        blueToggleValue: 'option1',
        bookmarks,
        COLORS,
        SVG_ICONS,
        inputGroupSaving: false,
        open: {
          bookmarksWidget: false,
          confirm: false,
          confirmDelete: false,
          menu: false,
          modal: false,
          popup: false,
        },
        savingBookmark: false,
        selectedBookmarkId: null,
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
          this.state.open.menu = !this.state.open.menu;
          this.update();
        },
        toggleBookmarksMenu: () => {
          this.state.open.bookmarksWidget = !this.state.open.bookmarksWidget;
          this.update();
        },
        handleBookmarksMenuSubmit: e => {
          switch (e.detail.action) {
            case 'select':
              console.log('Selected:', e.detail.value.id);
              break;
            case 'delete':
              this.update({bookmarks: this.state.bookmarks.filter(b => b.id !== e.detail.bookmarkId)});
              break;
            case 'create':
              this.update({savingBookmark: true});
              setTimeout(() => {
                console.log('Created:', e.detail.name);
                const newBookmark = {
                  id: (new Date()).getTime(),
                  user_id: 1,
                  name: e.detail.name,
                  user: 'John D.',
                };
                this.state.bookmarks.push(newBookmark);
                this.update({savingBookmark: false, selectedBookmarkId: newBookmark.id});
              }, 2000);
          }
        },
        handleBookmarksMenuChange: e => {
          this.state.open.bookmarksWidget = e.detail.open;
          this.update();
        },
      },
      template,
    };
  }
});
