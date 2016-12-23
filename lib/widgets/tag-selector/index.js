import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import css from './index.styl';
import template from './index.jade';

const LOADING_WIDGET = `loading_widget`;
const IDLE = `idle`;
const LOADING_TAG = `loading_tag`;
const LOADED_TAG = `loaded_tag`;
const ERROR = `error`;
const LOAD_STATES = [LOADING_WIDGET, IDLE, LOADING_TAG, LOADED_TAG, ERROR];

registerMPElement(`mp-tag-selector`, class extends Component {
  get config() {
    return {
      defaultState: {
        selectedTags: [],
        allTags: [],
        inputText: ``,
        loadState: IDLE,
      },
      css,
      template,
      helpers: {
        shouldShowFooter: () => {
          return !this.isAttributeEnabled(`read-only`) &&
            this.state.inputText &&
            !this._filterOptions(this.state.inputText).length;
        },
        getSearchMatches: () => this._filterOptions(this.state.inputText),
        setInputText: e => {
          this.update({inputText: e.target.value});
        },
        removeTag: tagName => {
          this._removeTag(tagName);
        },
        handleKeyActions: e => {
          if (e.keyCode === 13) {
            this._addTag(this.state.inputText);
          } else if (e.keyCode === 8 && this.state.selectedTags.length) { // backspace
            if (this.state.inputText.length === 0) {
              this._removeTag(this.state.selectedTags[this.state.selectedTags.length - 1]);
            }
          }
        },
        addTag: tagName => this._addTag(tagName),
      },
      useShadowDom: true,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    this.update({
      selectedTags: this.getJSONAttribute(`selected-tags`),
      allTags: this.getJSONAttribute(`all-tags`),
      loadState: this.getAttribute(`load-state`),
    });
  }

  attributeChangedCallback(attr) {
    super.attributeChangedCallback(...arguments);
    if (attr === `load-state`) {
      const loadState = this.getAttribute(`load-state`);
      if (LOAD_STATES.includes(loadState)) {
        this.update({loadState});
      }
    } else if (attr === `selected-tags`) {
      this.update({selectedTags: this.getJSONAttribute(`selected-tags`)});
    } else if (attr === `all-tags`) {
      this.update({allTags: this.getJSONAttribute(`all-tags`)});
    }
  }

  _filterOptions(inputText) {
    return this.state.allTags.filter(tag => !this.state.selectedTags.includes(tag) &&
      tag.toLowerCase().includes(inputText.toLowerCase()));
  }

  _removeTag(tagName) {
    this.setAttribute(`load-state`, LOADING_TAG);
    this.dispatchEvent(new CustomEvent(`change`, {detail: {tagName, action: `removeTag`}}));
    requestAnimationFrame(() => this.el.querySelector(`.search-input`).focus());
  }

  _addTag(tagName) {
    if (!this.state.selectedTags.includes(tagName)) {
      this.setAttribute(`load-state`, LOADING_TAG);
      this.dispatchEvent(new CustomEvent(`change`, {detail: {tagName, action: `addTag`}}));
    }
  }
});
