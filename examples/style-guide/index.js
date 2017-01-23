import 'babel-polyfill';

import 'webcomponents.js/webcomponents';

import { Component } from 'panel';

import '../../build/index';
import COLORS from '../../build/stylesheets/mixins/colors.json';
import { SVG_ICONS } from '../../build/components/svg-icon';
import bookmarks from './bookmark-data.json';

import template from './index.jade';
import './index.styl';

document.registerElement(`style-guide`, class extends Component {
  get config() {
    return {
      defaultState: {
        blueToggleValue: `option1`,
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
          tagSelector: false,
        },
        savingBookmark: false,
        selectedBookmarkId: null,
        tagSelectorLoadState: `idle`,
        tagSelectorData: {
          pinnedTags: new Set([`pinned tag`]),
          defaultTags: new Set([`default tag`]),
          selectedTags: new Set([`my tag`, `another tag`, `default tag`]),
          allTags: new Set([`my tag`, `another tag`, `pinned tag`, `default tag`, `our tag`, `his tag`]),
        },
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
          this.state.open[key] = state === `open`;
          this.update();
        },
        handleNamerChange: e => {
          console.log(`mp-input-group value changed to: `, e.target.value);
        },
        handleNamerSubmit: () => {
          this.update({inputGroupSaving: true});
          setTimeout(() => {
            this.update({inputGroupSaving: false});
            alert(`Saved!`);
          }, 2000);
        },
        toggleMenu: () => {
          this.state.open.menu = !this.state.open.menu;
          this.update();
        },
        handleBookmarksMenuSubmit: e => {
          switch (e.detail.action) {
            case `select`:
              console.log(`Selected:`, e.detail.value.id);
              break;
            case `delete`:
              this.update({bookmarks: this.state.bookmarks.filter(b => b.id !== e.detail.bookmarkId)});
              break;
            case `create`:
              this.update({savingBookmark: true});
              setTimeout(() => {
                console.log(`Created:`, e.detail.name);
                const newBookmark = {
                  id: (new Date()).getTime(),
                  user_id: 1,
                  name: e.detail.name,
                  user: `John D.`,
                };
                this.state.bookmarks.push(newBookmark);
                this.update({savingBookmark: false, selectedBookmarkId: newBookmark.id});
              }, 2000);
          }
        },
        handleBookmarksMenuChange: e => {
          if (e.detail.open) {
            this.state.open.bookmarksWidget = e.detail.open;
          }
          this.update();
        },
        toggleTagSelector: () => {
          this.state.open.tagSelector = !this.state.open.tagSelector;
          this.update();
        },
        handleTagSelectorDropMenuChange: e => {
          this.state.open.tagSelector = e.detail.state !== `closed`;
          this.update();
        },
        handleTagSelectorChange: e => {
          e.stopImmediatePropagation(); // i hate that we have to do this
          // handle whatever business logic we need to deal with when
          // adding or removing a tag
          const tagName = e.detail.tagName;
          if (e.detail.action === `addTag`) {
            this.state.tagSelectorData.selectedTags.add(tagName);
            this.state.tagSelectorData.allTags.add(tagName);
          } else if (e.detail.action === `removeTag`) {
            this.state.tagSelectorData.selectedTags.delete(tagName);
          }
          // normally we'd persist to server and this timeout represents that
          // async call
          clearTimeout(this.loadingTagTimeout);
          this.update({tagSelectorLoadState: `loading_tag`});
          this.loadingTagTimeout = setTimeout(() => {
            this.update({tagSelectorLoadState: `loaded_tag`});
          }, 700);
        },
        handleTagSelectorSubmit: e => {
          this.state.open.tagSelector = false;
          this.update();
        },
      },
      template,
    };
  }
});
