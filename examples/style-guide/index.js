import 'babel-polyfill';

import 'webcomponents.js/webcomponents';

import { Component } from 'panel';

import '../../build/index';
import COLORS from '../../build/stylesheets/mixins/colors.json';
import { SVG_ICONS } from '../../build/components/svg-icon';
import { extend } from '../../build/util';
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
          tutorialTooltip: {},
        },
        savingBookmark: false,
        selectedBookmarkId: null,
        tagSelectorLoadState: `idle`,
        tagSelectorData: {
          selectedTags: new Set([`my tag`, `another tag`, `my dashboard`]),
          allTags: new Set([`my tag`, `another tag`, `our tag`, `his tag`, `my dashboard`]),
        },
        toasts: [],
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

        getElementStr: el => {
          const attributesStr = Array.from(el.attributes).map(attribute => {
            return `${attribute.nodeName}="${attribute.nodeValue}"`
          }).join(` `);
          return `<${el.tagName.toLowerCase()} ${attributesStr}>`;
        },

        handleInsertComponent: el => {
          const textEl = document.createElement(`div`);
          textEl.textContent = this.helpers.getElementStr(el);
          const parentEl = el.parentElement;
          parentEl.insertBefore(textEl, parentEl.childNodes[0]);
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
                  user_id: 1, // eslint-disable-line camelcase
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
        handleTagSelectorSave: e => {
          this.state.tagSelectorData.saving = true;
          this.update();
          setTimeout(() => { // mock network request latency
            this.state.tagSelectorData.selectedTags = new Set([...e.detail.tags]);
            this.state.tagSelectorData.saving = false;
            this.state.open.tagSelector = false;
            this.update();
          }, 2000);
        },
        handleTagSelectorChange: e => {
          if (e.detail && e.detail.action) {
            const tag = e.detail.tagName;
            if (e.detail.action === `addTag`) {
              this.state.tagSelectorData.selectedTags.add(tag);
              this.state.tagSelectorData.allTags.add(tag);
              this.update();
            } else if (e.detail.action === `removeTag`) {
              this.state.tagSelectorData.selectedTags.delete(tag);
              this.update();
            }
          }
        },
        handleTagSelectorSubmit: () => {
          this.state.open.tagSelector = false;
          this.update();
        },
        addToast: () => {
          this.state.toasts.push({message: `Hi, I'm toast ${new Date().getTime()}`, cta: `undo`, closed: false});
          this.update();
        },
        closeToast: toast => {
          toast.closed = true;
          this.update();
        },
        toggleTutorialTooltip: name => {
          this.update({
            open: extend(open, {
              tutorialTooltip: {
                [name]: !this.state.open.tutorialTooltip[name],
              },
            }),
          });
        },
      },
      template,
    };
  }
});
