import { Component } from 'panel';
import { registerMPElement } from  '../../util/register-element.js';
import template from './index.jade';
import css from './index.styl';

registerMPElement(`mp-bookmarks-widget`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        activeBookmark: null,
        bookmarks: [],
        confirmDeleteBookmarkId: null,
        createMode: false,
        filteredBookmarks: [],
        filterText: ``,
        name: ``,
        open: false,
        selectedBookmark: null,
        userId: null,
      },
      helpers: {
        toggleBookmarksMenu: () => this.setAttribute(`open`, !this.state.open),
        handleDropMenuChange: e => {
          e.stopImmediatePropagation();
          if (e.detail.state === `open`) {
            this.el.querySelector(`.mp-bm-menu-search input`).focus();
          }
        },
        handleSubmit: e => {
          if (e.detail.action === `select`) {
            this.setAttribute(`open`, false);
          }
        },
        setFilterText: e => {
          this.update({filterText: e.target.value});
          this._filterBookmarks();
          this._setActiveBookmark(this.state.filteredBookmarks[0]);
        },
        activateBookmark: bookmark => {
          this._setActiveBookmark(bookmark, false);
        },
        selectBookmark: bookmark => {
          this._selectBookmark(bookmark);
        },
        openConfirmDeleteDialog: (e, bookmark) => {
          e.stopImmediatePropagation();
          this.update({confirmDeleteBookmark: bookmark});
        },
        handleConfirmModalChange: e => {
          e.stopImmediatePropagation();
          if (e.detail.state === `closed`) {
            this.update({confirmDeleteBookmark: null});
          }
        },
        handleConfirmSubmit: e => {
          if (e.detail.action === `confirm`) {
            this.dispatchEvent(new CustomEvent(`submit`, {
              detail: {
                action: `delete`,
                bookmarkId: this.state.confirmDeleteBookmark.id,
              },
            }));
          }
        },
        goToCreateMode: () => {
          this.update({createMode: true});
          window.requestAnimationFrame(() => this.el.querySelector(`mp-input-group`).focus());
        },
        createBookmark: e => {
          e.stopImmediatePropagation();
          this.update({createMode: false});
          this.setAttribute(`saving`, true);
          this.dispatchEvent(new CustomEvent(`submit`, {detail: {action: `create`, name: this.state.name}}));
        },
        setName: e => {
          e.stopImmediatePropagation();
          this.update({name: e.target.value});
        },
        stopPropagation: e => {
          e.stopImmediatePropagation();
        },
      },
    };
  }

  _sortBookmarks(a, b) {
    // put all bookmarks for the logged in "userId" at the top
    // then sort by name
    const aIsLoggedInUser = a.user_id === this.state.userId;
    const bIsLoggedInUser = b.user_id === this.state.userId;
    if (aIsLoggedInUser === bIsLoggedInUser) {
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    } else {
      return aIsLoggedInUser ? -1 : 1;
    }
  }

  _filterBookmarks() {
    const filteredBookmarks = this.state.bookmarks
      .filter(b => b.name.toLowerCase().includes(this.state.filterText.toLowerCase()))
      .sort((a, b) => this._sortBookmarks(a, b));
    this.update({filteredBookmarks});
  }

  _setActiveBookmark(activeBookmark, scrollIntoView=true) {
    this.update({activeBookmark});

    if (scrollIntoView) {
      window.requestAnimationFrame(() => {
        const activeEl = this.el.querySelector(`.mp-bm-menu-list-item-active`);
        if (activeEl) {
          const listEl = this.el.querySelector(`.mp-bm-menu-list`);
          const viewportBottom = listEl.scrollTop + listEl.offsetHeight;
          const activeElBottom = activeEl.offsetTop + activeEl.offsetHeight;
          if (activeEl.offsetTop < listEl.scrollTop) {
            listEl.scrollTop = activeEl.offsetTop;
          } else if (activeElBottom > viewportBottom) {
            listEl.scrollTop = activeElBottom - listEl.offsetHeight;
          }
        }
      });
    }
  }

  _resetActiveBookmark() {
    const selectedBookmark = this.state.filteredBookmarks.find(b => b.id === parseInt(this.getAttribute(`selected-bookmark-id`)));
    this._setActiveBookmark(selectedBookmark || this.state.filteredBookmarks[0]);
  }

  _selectBookmark(selectedBookmark) {
    this.update({selectedBookmark});
    this.setAttribute(`open`, false);
    this.setAttribute(`selected-bookmark-id`, selectedBookmark.id);
    this.dispatchEvent(new CustomEvent(`submit`, {detail: {action: `select`, value: selectedBookmark}}));
  }

  _parseAttribute(name) {
    switch(name) {
      case `bookmarks`: {
        this.state.bookmarks = this.getJSONAttribute(`bookmarks`) || [];
        this._filterBookmarks();
        this._resetActiveBookmark();
        break;
      }
      case `open`: {
        const open = this.isAttributeEnabled(`open`);
        this.dispatchEvent(new CustomEvent(`change`, {detail: {open}}));
        this.update({open});
        break;
      }
      case `saving`: {
        this.update({saving: this.isAttributeEnabled(`saving`)});
        break;
      }
      case `selected-bookmark-id`: {
        this._resetActiveBookmark();
        break;
      }
      case `user-id`: {
        this.state.userId = parseInt(this.getAttribute(`user-id`));
        this._filterBookmarks();
        this._resetActiveBookmark();
        break;
      }
    }
  }

  attachedCallback() {
    super.attachedCallback();

    this.clickOutsideListener = e => {
      if (this.state.open && e.target !== this) {
        this.setAttribute(`open`, false);
      }
    };
    document.addEventListener(`click`, this.clickOutsideListener);

    this.windowKeydownListener = e => {
      if (this.state.open && e.keyCode === 27) { // esc key
        this.setAttribute(`open`, false);
      }
    };
    window.addEventListener(`keydown`, this.windowKeydownListener);

    this.localKeydownListener = e => {
      if (this.state.open) {
        switch(e.keyCode) {
          case 13: // enter
            this._selectBookmark(this.state.activeBookmark);
            break;
          case 38: { // up arrow
            e.preventDefault();
            const bookmarks = this.state.filteredBookmarks;
            const activeIdx = bookmarks.indexOf(this.state.activeBookmark);
            if (activeIdx !== 0) {
              this._setActiveBookmark(bookmarks[activeIdx - 1]);
            }
            break;
          }
          case 40: { // down arrow
            e.preventDefault();
            const bookmarks = this.state.filteredBookmarks;
            const activeIdx = bookmarks.indexOf(this.state.activeBookmark);
            if (activeIdx < bookmarks.length - 1) {
              this._setActiveBookmark(bookmarks[activeIdx + 1]);
            }
            break;
          }
        }
      }
    };
    this.addEventListener(`keydown`, this.localKeydownListener);

    // bootstrap the widget's state from attributes
    this.update({
      bookmarks: this.getJSONAttribute(`bookmarks`),
      open: this.isAttributeEnabled(`open`),
      saving: this.isAttributeEnabled(`saving`),
      userId: parseInt(this.getAttribute(`user-id`)),
    });
    this._filterBookmarks();
    if (this.state.open) {
      this._resetActiveBookmark();
    }
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    window.removeEventListener(`keydown`, this.windowKeydownListener);
    this.removeEventListener(`keydown`, this.localKeydownListener);
    document.removeEventListener(`click`, this.clickOutsideListener);
  }

  attributeChangedCallback(name) {
    super.attributeChangedCallback(...arguments);
    if (this.initialized) {
      this._parseAttribute(name);
    }
  }
});


