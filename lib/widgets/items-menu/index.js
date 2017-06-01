import {Component} from 'panel';

import {extend} from '../../util';
import {defaultOrdering, lexicalCompose, mapArguments} from '../../util/function';
import {registerMPElement} from  '../../util/register-element.js';
import {stringFilterMatches} from '../../util/string';

import css from './index.styl';
import template from './index.jade';

const PROGRESSIVE_LIST_BUFFER_PX = 250;

class ItemsMenu extends Component {
  get config() {
    return {
      useShadowDom: true,
      css,
      template,
      defaultState: {
        searchFilter: null,
        emptyMessage: null,
        sections: [],
        progressiveListSize: 20,
        focusedItemIndex: 0,
        isProgressive: false,
        isPropertiesPillFocused: false,
      },
      helpers: {
        getSections: () => {
          let filteredSections = this.getFilteredSections();
          if (this.state.isProgressive) {
            filteredSections = filteredSections.map(section => {
              const items = section.items.filter(item => item.index < this.state.progressiveListSize);
              return extend(section, {items});
            }).filter(section => section.items.length > 0 || section.isLoading);
          }
          return filteredSections;
        },

        unwrapItem: item => this.unwrapItem(item),

        handlePostPatch: () => {
          // When this component is patched, the height of it could change. Send a draw event so users of the
          // component can respond to the height change accordingly.
          this.dispatchEvent(new CustomEvent(`draw`));
        },

        handleClickBack: () => {
          this.dispatchEvent(new CustomEvent(`clickBack`));
        },

        handleMouseenterPropertiesPill: () => {
          this.update({isPropertiesPillFocused: true});
        },

        handleMouseleavePropertiesPill: () => {
          this.update({isPropertiesPillFocused: false});
        },

        handleMouseenterItem: item => {
          this.update({isPropertiesPillFocused: false});
          this.focusItem(item.index);
        },

        handleClickItem: (item, modifierKey) => {
          this.handleClickItem(item, modifierKey);
        },

        handleClickPropertiesPill: item => {
          this.handleClickPropertiesPill(item);
        },
      },
    };
  }

  set keydownProxyEl(domElement) {
    if (this._keydownProxyEl) {
      this._keydownProxyEl.removeEventListener(`keydown`, this.handleKeydown);
    }
    this._keydownProxyEl = domElement;
    this._keydownProxyEl.addEventListener(`keydown`, this.handleKeydown);
  }

  createdCallback() {
    super.createdCallback(...arguments);
    this.handleKeydown = ev => {
      if (Object.values(this.NAVIGATION_KEY_CODES).includes(ev.keyCode)) {
        ev.stopPropagation();
        ev.preventDefault();
      }

      if (ev.keyCode === this.NAVIGATION_KEY_CODES.TAB) {
        // TODO(mack): Would probably be cleaner to implement this state on the item itself.
        this.update({isPropertiesPillFocused: !this.state.isPropertiesPillFocused});
      } else if (ev.keyCode === this.NAVIGATION_KEY_CODES.ENTER) {
        if (this.state.isPropertiesPillFocused) {
          this.handleClickPropertiesPill(this.getFocusedItem());
        } else {
          this.handleClickItem(this.getFocusedItem());
        }
      } else if (ev.keyCode === this.NAVIGATION_KEY_CODES.UP_ARROW) {
        this.focusItem(Math.max(this.state.focusedItemIndex - 1, 0));
        window.requestAnimationFrame(() => {
          this.scrollToItemIfNeeded();
        });
      } else if (ev.keyCode === this.NAVIGATION_KEY_CODES.DOWN_ARROW) {
        this.focusItem(Math.min(
          this.state.focusedItemIndex + 1,
          this.getSectionsSize(this.getFilteredSections()) - 1
        ));
        window.requestAnimationFrame(() => {
          this.scrollToItemIfNeeded();
        });
      }
    };
  }

  focusItem(focusedItemIndex) {
    this.update({focusedItemIndex});
    this.dispatchEvent(new CustomEvent(`focusItem`, {detail: {item: this.getFocusedItem()}}));
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    this.handleScroll = ev => {
      const scrollBottom = ev.target.scrollTop + ev.target.offsetHeight;
      if (this.state.isProgressive && scrollBottom + PROGRESSIVE_LIST_BUFFER_PX >= ev.target.scrollHeight) {
        this.increaseProgressiveListSize();
      }
    };
    this.addEventListener(`scroll`, this.handleScroll);
    this.addEventListener(`keydown`, this.handleKeydown);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.removeEventListener(`scroll`, this.handleScroll);
    this.removeEventListener(`keydown`, this.handleKeydown);
    if (this._keydownProxyEl) {
      this._keydownProxyEl.removeEventListener(`keydown`, this.handleKeydown);
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(...arguments);
    switch (name) {
      case `search-filter`:
        this.update({searchFilter: newVal});
        break;
      case `empty-message`:
        this.update({emptyMessage: newVal});
        break;
      case `sections`:
        this.update({sections: this.getJSONAttribute(`sections`)});
        break;
      case `progressive`:
        this.update({isProgressive: this.isAttributeEnabled(`progressive`)});
        break;
    }
  }

  getProcessedSections() {
    return this.state.sections.map(section => {
      const items = section.items.map(item => this.wrapItem(item));
      return extend(section, {items});
    });
  }

  wrapItem(item) {
    return extend({wrapped: item}, item);
  }

  unwrapItem(item) {
    return item.wrapped;
  }

  getFilteredSections() {
    const processedSections = this.getProcessedSections();

    let index = 0;
    return processedSections.map(section => {
      const items = this.getMatchingItems(this.state.searchFilter, section.items);
      items.forEach(item => item.index = index++);
      return extend(section, {items});
    });
  }

  getSectionsSize(sections) {
    return sections.reduce((numItems, section) => {
      return numItems + section.items.length;
    }, 0);
  }

  getMatchingItems(searchFilter, items) {
    if (!searchFilter) {
      return items;
    }

    return items
      .map(item => extend(item, {
        matches: stringFilterMatches(item.label, searchFilter),
      }))
      .filter(item => !!item.matches)
      .sort(lexicalCompose(
        // prioritize beginning match
        mapArguments(defaultOrdering, item => -item.matches[0].length),
        // second: a-z
        mapArguments(defaultOrdering, item => item.label.toLowerCase())
      ));
  }

  increaseProgressiveListSize() {
    if (this.state.progressiveListSize < this.getSectionsSize(this.getFilteredSections())) {
      const progressiveListSize = this.state.progressiveListSize * 2;
      this.update({progressiveListSize});
    }
  }

  getFocusedItem() {
    let focusedItem;
    this.getFilteredSections().find(section => {
      return section.items.find(item => {
        if (item.index === this.state.focusedItemIndex) {
          focusedItem = item;
          return true;
        } else {
          return false;
        }
      });
    });
    return focusedItem;
  }

  scrollToItemIfNeeded() {
    const listEl = this;
    const focusedEl = this.el.querySelector(`.list-option.focused`);
    if (!focusedEl) {
      return;
    }

    // The top threshold should be large enough to account for section header
    const THRESHOLD_TOP = 45;
    const THRESHOLD_BOTTOM = 45;
    const listElTop = listEl.scrollTop;
    const listElBottom = listElTop + listEl.offsetHeight;
    const focusedElTop = focusedEl.offsetTop - listEl.offsetTop;
    const focusedElBottom = focusedElTop + focusedEl.offsetHeight;
    if (focusedElTop - THRESHOLD_TOP < listElTop) {
      listEl.scrollTop = focusedElTop - THRESHOLD_TOP;
    } else if (focusedElBottom + THRESHOLD_BOTTOM > listElBottom) {
      listEl.scrollTop = focusedElBottom + THRESHOLD_BOTTOM - listEl.offsetHeight;
    }
  }

  handleClickItem(item, modifierKey = false) {
    this.dispatchEvent(new CustomEvent(`clickItem`, {detail: {item: this.unwrapItem(item), modifierKey}}));
  }

  handleClickPropertiesPill(item) {
    this.dispatchEvent(new CustomEvent(`clickPropertiesPill`, {detail: {item: this.unwrapItem(item)}}));
  }

  focus() {
    this.el.querySelector(`.screen-list-container`).focus();
  }
}

ItemsMenu.NAVIGATION_KEY_CODES = ItemsMenu.prototype.NAVIGATION_KEY_CODES = {
  TAB: 9,
  ENTER: 13,
  UP_ARROW: 38,
  DOWN_ARROW: 40,
};

ItemsMenu.ITEM_TYPE_EVENT = ItemsMenu.prototype.ITEM_TYPE_EVENT = `event`;
ItemsMenu.ITEM_TYPE_PROPERTY = ItemsMenu.prototype.ITEM_TYPE_PROPERTY = `property`;

export default registerMPElement(`mp-items-menu`, ItemsMenu);
