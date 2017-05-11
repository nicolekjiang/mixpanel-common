import {Component} from 'panel';

import {extend} from '../../util';
import {defaultOrdering, lexicalCompose, mapArguments} from '../../util/function';
import {stringFilterMatches} from '../../util/string';

const PROGRESSIVE_LIST_BUFFER_PX = 250;

import css from './index.styl';
import template from './index.jade';

export default class ItemsMenu extends Component {
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
        isPropertiesPillFocused: false,
      },
      helpers: {
        getSections: () => {
          const filteredSections = this.getFilteredSections();
          return filteredSections.map(section => {
            const items = section.items.filter(item => item.index < this.state.progressiveListSize);
            return extend(section, {items});
          }).filter(section => section.items.length > 0 || section.isLoading);
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
          this.update({
            isPropertiesPillFocused: false,
            focusedItemIndex: item.index,
          });
        },

        handleClickItem: item => {
          this.handleClickItem(item);
        },

        handleClickPropertiesPill: item => {
          this.handleClickPropertiesPill(item);
        },
      },
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    this.handleScroll = ev => {
      const scrollBottom = ev.target.scrollTop + ev.target.offsetHeight;
      if (scrollBottom + PROGRESSIVE_LIST_BUFFER_PX >= ev.target.scrollHeight) {
        this.increaseProgressiveListSize();
      }
    };
    this.addEventListener(`scroll`, this.handleScroll);

    this.handleKeydown = ev => {
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
        this.update({focusedItemIndex: Math.max(this.state.focusedItemIndex - 1, 0)});
        window.requestAnimationFrame(() => {
          this.focusItemIfNeeded();
        });
      } else if (ev.keyCode === this.NAVIGATION_KEY_CODES.DOWN_ARROW) {
        this.update({
          focusedItemIndex: Math.min(
            this.state.focusedItemIndex + 1,
            this.getSectionsSize(this.getFilteredSections()) - 1
          ),
        });
        window.requestAnimationFrame(() => {
          this.focusItemIfNeeded();
        });
      }

      ev.stopPropagation();
      ev.preventDefault();
    };

    this.addEventListener(`keydown`, this.handleKeydown);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.removeEventListener(`keydown`, this.handleKeydown);
    this.removeEventListener(`scroll`, this.handleScroll);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(...arguments);
    if (name === `search-filter`) {
      this.update({searchFilter: newVal});
    } else if (name === `empty-message`) {
      this.update({emptyMessage: newVal});
    } else if (name === `sections`) {
      this.update({sections: this.getJSONAttribute(`sections`)});
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

  focusItemIfNeeded() {
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

  handleClickItem(item) {
    this.dispatchEvent(new CustomEvent(`clickItem`, {detail: {item: this.unwrapItem(item)}}));
  }

  handleClickPropertiesPill(item) {
    this.dispatchEvent(new CustomEvent(`clickPropertiesPill`, {detail: {item: this.unwrapItem(item)}}));
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

document.registerElement(`mp-items-menu`, ItemsMenu);
