import {Component} from 'panel';

import bookmarks from './bookmark-data.json';

import template from './index.jade';
import './index.styl';

const NAVIGATION_KEY_CODES = {
  TAB: 9,
  ENTER: 13,
  UP_ARROW: 38,
  DOWN_ARROW: 40,
};

document.registerElement(`widgets-section`, class extends Component {
  get config() {
    return {
      defaultState: {
        currentBookmark: `default`,
        bookmarks,
        itemsMenuOpen: false,
        savingBookmark: false,
        selectedBookmarkId: null,
        tagSelectorLoadState: `idle`,
        tagSelectorData: {
          selectedTags: new Set([`my tag`, `another tag`, `my dashboard`]),
          allTags: new Set([`my tag`, `another tag`, `our tag`, `his tag`, `my dashboard`]),
        },
      },
      helpers: {
        sectionChange: e => {
          this.update({sectionFilter: e.currentTarget.dataset.filterName});
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
        handleItemFocus: ev => {
          const item = ev.detail.item;
          if (item.description) {
            this.update({eventDefinition: {name: item.label, description: item.description}});
          } else {
            if (this.state.eventDefinition) {
              this.update({eventDefinition: null});
            }
          }
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
        toggleBookmarkType: type => {
          const bookmark = this.el.querySelector(`mp-bookmarks-widget`);
          setTimeout(() => bookmark.setAttribute(`open`, true), 200);
          const currentBookmark = type;
          this.update({currentBookmark});
        },
        handleItemsMenuModalChange: ev => {
          const state = ev.detail.state;
          this.update({itemsMenuOpen: state === `open`});
        },
        handleItemsMenuFocus: () => {
          this.update({itemsMenuOpen: true});
        },
        handleItemsMenuBlur: () => {
          this.update({itemsMenuOpen: false, eventDefinition: null});
        },
        handleItemsMenuInput: ev => {
          this.update({itemsMenuSearchFilter: ev.target.value});
        },
        handleItemsMenuKeydown: ev => {
          if (Object.values(NAVIGATION_KEY_CODES).indexOf(ev.keyCode) !== -1) {
            ev.preventDefault();
            ev.stopPropagation();

            const eventsMenuEl = ev.target.parentNode.parentNode.querySelector(`mp-items-menu`);
            // There's a bug in chromium where it's not possible to set keyCode on KeyboardEvent,
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
              description: `These are your top events in the whole entire world.`,
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
              description: `Sample description for an add to shortlist event.`,
            }, {
              label: `$autotrack_pageview`,
              icon: `autotrack`,
              description: `A pageview, but tracked by autotrack.`,
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
      },
      template,
    };
  }
});
