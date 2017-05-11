import 'babel-polyfill';

import 'webcomponents.js/webcomponents';

import { Component } from 'panel';

import '../../build/index';
import COLORS from '../../build/stylesheets/mixins/colors.json';
import { SVG_ICONS } from '../../build/components/svg-icon';
import { extend } from '../../build/util';
import ItemsMenu from '../../build/widgets/items-menu';
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
          itemMenu: false,
          modal: false,
          popup: false,
          tagSelector: false,
          tutorialTooltip: {},
        },
        itemsMenuSearchFilter: ``,
        savingBookmark: false,
        selectedBookmarkId: null,
        tagSelectorLoadState: `idle`,
        tagSelectorData: {
          selectedTags: new Set([`my tag`, `another tag`, `my dashboard`]),
          allTags: new Set([`my tag`, `another tag`, `our tag`, `his tag`, `my dashboard`]),
        },
        toasts: [],
        tooltipStep: 0,
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

        closeTutorialNextTooltip: () => {
          this.update({tooltipStep: 0});
          this.helpers.toggleTutorialTooltip('next');
        },
        incrementTooltipStep: () => this.update({tooltipStep: this.state.tooltipStep + 1}),
        resetTooltipStep: e => {
          e.stopPropagation();
          this.update({tooltipStep: 0});
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

        handleItemsMenuFocus: () => {
          this.state.open.itemsMenu = true;
          this.update();
        },

        handleItemsMenuBlur: () => {
          this.state.open.itemsMenu = false;
          this.update();
        },

        handleItemsMenuInput: ev => {
          this.update({itemsMenuSearchFilter: ev.target.value});
        },

        handleItemsMenuKeydown: ev => {
          if (Object.values(ItemsMenu.NAVIGATION_KEY_CODES).indexOf(ev.keyCode) !== -1) {
            ev.preventDefault();
            ev.stopPropagation();

            const eventsMenuEl = ev.target.parentNode.querySelector(`mp-items-menu`);
            // There's a bug in chromnium where it's not possible to set keyCode on KeyboardEvent,
            // so use a CustomEvent instead
            const clonedEvent = new Event(ev.type, ev);
            clonedEvent.keyCode = ev.keyCode;
            eventsMenuEl.dispatchEvent(clonedEvent);
          }
        },

        getItemsMenuSections: () => {
          const sections = [{
            label: `Loading section`,
            isLoading: true,
            items: [],
          }, {
            label: `Recently Viewed`,
            items: [{
              label: `Top Events`,
              icon: `star-top-events`,
              isSelected: true,
              hasPropertiesPill: true,
            }, {
              label: `[Collect everything] Clicked cancel edit elements`,
              icon: `event`,
              hasPropertiesPill: true,
              isPropertiesPillDisabled: true,
              hasCaret: true,
            }],
          }, {
            label: `Events`,
            items: [{
              label: `All Events`,
              icon: `star-top-events`,
              isSelected: true,
              hasCaret: true,
              isDisabled: true,
            }, {
              label: `Top Events`,
              icon: `star-top-events`,
              isSelected: true,
              isDisabled: true,
              hasPropertiesPill: true,
            }, {
              label: `[Collect everything] Clicked cancel edit elements`,
              icon: `event`,
              isDisabled: true,
            }, {
              label: `All: Add to shortlist v3`,
              icon: `custom-events`,
            }, {
              label: `$autotrack_pageview`,
              icon: `autotrack`,
            }, {
              label: `Viewed report`,
              icon: null,
            }],
          }, {
            items: [{
              icon: `profile`,
              label: `All People`,
            }],
          }, {
            items: [{
              label: `Device Model`,
              icon: `type-text`,
            }, {
              label: `Device Pixel Ratio (is it retina?)`,
              icon: `type-number`,
            }, {
              label: `Email`,
              icon: `type-text`,
            }, {
              label: `Error`,
              icon: `type-boolean`,
            }, {
              label: `User Ids`,
              icon: `type-list`,
            }, {
              label: `Created`,
              icon: `type-date`,
            }],
          }, {
            label: `Non-icon items`,
            items: [{
              label: `Last 96 hours`,
            }, {
              label: `Last 30 days`,
            }],
          }, {
            label: `Uppercase items`,
            items: [{
              isUppercase: true,
              label: `Events`,
            }, {
              isUppercase: true,
              label: `People`,
            }],
          }, {
            label: `Sorted items`,
            items: [{
              label: `Events`,
            }, {
              isUppercase: true,
              label: `People`,
            }],
          }];

          // Duplicate the menu to make it longer to trigger pagination
          return [
            ...sections,
            ...sections,
            ...sections,
            ...sections,
          ];
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
