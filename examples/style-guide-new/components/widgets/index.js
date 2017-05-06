import { Component } from 'panel';

import bookmarks from './bookmark-data.json';

import template from './index.jade';
import './index.styl';

document.registerElement('widgets-section', class extends Component {
  get config() {
    return {
      defaultState: {
        currentBookmark: `default`,
        bookmarks,
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
        hideSectionOnSearch: sectionId => {
          const sectionKeywords = sectionId.split('-').join(' ');
          if (this.state.sectionOpen != 'search' || sectionKeywords.includes(this.state.searchTerm)) {
            return false
          }
          return true;
        },
      },
      template,
    };
  }
});
