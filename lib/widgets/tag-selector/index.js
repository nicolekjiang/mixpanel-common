import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';
import { stringFilterMatches, toSentenceCase } from  '../../util/string.js';
import { lexicalCompose, mapArguments, defaultOrdering } from  '../../util/function.js';

import css from './index.styl';
import template from './index.jade';

const LOADING_WIDGET = `loading_widget`;
const IDLE = `idle`;
const LOADING_TAG = `loading_tag`;
const LOADED_TAG = `loaded_tag`;
const ERROR = `error`;
const LOAD_STATES = [LOADING_WIDGET, IDLE, LOADING_TAG, LOADED_TAG, ERROR];
const MIN_INPUT_WIDTH = `12px`;

registerMPElement(`mp-tag-selector`, class extends Component {
  get config() {
    return {
      defaultState: {
        activeTagIndex: -1,
        selectedTags: new Set(),
        allTags: new Set(),
        matchingTags: [],
        inputText: ``,
        inputWidth: MIN_INPUT_WIDTH,
        loadState: IDLE,
      },
      css,
      template,
      helpers: {
        setInputText: e => {
          this.update({inputText: e.target.value});
          this._resizeInput();
          this._filterTags();
        },
        showCreateButton: () => {
          const isNewTag = this.state.inputText
            && !this.state.matchingTags.filter(tag => tag.toLowerCase() === this.state.inputText.toLowerCase()).length
            && !this.state.selectedTags.has(this.state.inputText);
          return isNewTag && !this.isAttributeEnabled(`read-only`);
        },
        toSentenceCase,
        addTag: tagName => this._addTag(tagName),
        removeTag: tagName => this._removeTag(tagName),
        focusInput: () => this.focus(),
        handleKeyPress: e => {
          switch(e.keyCode) {
            case 13:  // enter
              if (this.state.activeTagIndex > -1) {
                this._addTag(this.state.matchingTags[this.state.activeTagIndex]);
              } else if (!this.isAttributeEnabled(`read-only`)) {
                this._addTag(this.state.inputText);
              }
              break;
            default:
              this._resetActiveTagIndex();
              break;
          }
        },
        handleKeyDown: e => {
          switch(e.keyCode) {
            case 38: // up arrow
              this.update({activeTagIndex: Math.max(0, this.state.activeTagIndex - 1)});
              break;
            case 40: // down arrow
              this.update({activeTagIndex: Math.min(this.state.matchingTags.length - 1, this.state.activeTagIndex + 1)});
              break;
            default:
              break;
          }
        },
        stringFilterMatches,
      },
      useShadowDom: true,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    this.update({
      selectedTags: new Set(this.getJSONAttribute(`selected-tags`)),
      allTags: new Set(this.getJSONAttribute(`all-tags`)),
      loadState: this.getAttribute(`load-state`),
    });
    this._filterTags();
  }

  attributeChangedCallback(attr) {
    super.attributeChangedCallback(...arguments);
    if (this.initialized) {
      switch(attr) {
        case `load-state`: {
          const loadState = this.getAttribute(`load-state`);
          if (LOAD_STATES.includes(loadState)) {
            this.update({loadState});
          }
          break;
        }
        case `selected-tags`:
          this.update({selectedTags: new Set(this.getJSONAttribute(`selected-tags`))});
          this._filterTags();
          break;
        case `all-tags`:
          this.update({allTags: new Set(this.getJSONAttribute(`all-tags`))});
          this._filterTags();
          break;
      }
    }
  }

  focus() {
    this.el.querySelector(`.mp-tag-selector-search-input`).focus();
  }

  _filterTags() {
    const search = this.state.inputText.trim();
    const matchingTags = [...this.state.allTags]
      .filter(tag => !this.state.selectedTags.has(tag) && stringFilterMatches(tag, search))
      .sort(
        lexicalCompose(
          // first sort by whether the string matches the search string exactly
          mapArguments(defaultOrdering, a => a.toLowerCase() === search.toLowerCase() ? 0 : 1),
          // then sort alphabetically
          mapArguments(defaultOrdering, a => a.toLowerCase())));
    let activeTagIndex = matchingTags.map(t => t.toLowerCase()).indexOf(search.toLowerCase());
    if(activeTagIndex === -1 && matchingTags.length)
      activeTagIndex = 0;
    this.update({matchingTags, activeTagIndex});
  }

  _resizeInput() {
    // make the search input width dynamic
    const span = document.createElement(`span`);
    span.className = `mp-tag-selector-search-input-dummy`;
    span.innerText = this.el.querySelector(`.mp-tag-selector-search-input`).value;
    this.el.appendChild(span);
    const buffer = 12;
    this.update({inputWidth: span.offsetWidth + buffer + `px`});
    this.el.removeChild(span);
  }

  _resetActiveTagIndex() {
    this.update({activeTagIndex: -1});
  }

  _removeTag(tagName) {
    this.state.selectedTags.delete(tagName);
    this._resetActiveTagIndex();
    this.setAttribute(`load-state`, LOADING_TAG);
    this.dispatchEvent(new CustomEvent(`change`, {detail: {tagName, action: `removeTag`}}));
    requestAnimationFrame(() => this.focus());
  }

  _addTag(tagName) {
    tagName = tagName.trim();
    if (tagName && !this.state.selectedTags.has(tagName)) {
      this.state.selectedTags.add(tagName);
      this.update({inputText:``, inputWidth: MIN_INPUT_WIDTH});
      this._resetActiveTagIndex();
      this.dispatchEvent(new CustomEvent(`change`, {detail: {tagName, action: `addTag`}}));
      requestAnimationFrame(() => this.focus());
    }
  }
});
