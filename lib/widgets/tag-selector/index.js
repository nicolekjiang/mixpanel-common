import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';
import { stringFilterMatches, toSentenceCase } from  '../../util/string.js';
import { lexicalCompose, mapArguments, defaultOrdering } from  '../../util/function.js';

import css from './index.styl';
import template from './index.jade';

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
            && !this.state.matchingTags.filter(tag => tag === this.state.inputText.toLowerCase()).length
            && !this.state.selectedTags.has(this.state.inputText);
          return isNewTag && !this.isAttributeEnabled(`read-only`);
        },
        toSentenceCase,
        addTag: tagName => this._addTag(tagName),
        removeTag: tagName => this._removeTag(tagName),
        saveTags: () => {
          if (!this.isAttributeEnabled(`saving`)) {
            this.dispatchEvent(new CustomEvent(`save`, {detail: {tags: this.state.selectedTags}}));
          }
        },
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
    });
    this._filterTags();
  }

  attributeChangedCallback(attr) {
    super.attributeChangedCallback(...arguments);
    if (this.initialized) {
      switch(attr) {
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
    var searchInput = this.el.querySelector(`.mp-tag-selector-search-input`);
    if(searchInput) {
      searchInput.focus();
    }
  }

  _filterTags() {
    const search = this.state.inputText.trim().toLowerCase();
    const matchingTags = [...this.state.allTags]
      .map(tag => tag.toLowerCase())
      .filter(tag => !this.state.selectedTags.has(tag) && stringFilterMatches(tag, search))
      .sort(
        lexicalCompose(
          // first sort by whether the string matches the search string exactly
          mapArguments(defaultOrdering, a => a.toLowerCase() === search ? 0 : 1),

          // next place 'my dashboard' at the top
          mapArguments(defaultOrdering, a => a.toLowerCase() === `my dashboard` ? 0 : 1),

          // then sort alphabetically
          mapArguments(defaultOrdering, a => a.toLowerCase())
        )
      );
    let activeTagIndex = matchingTags.indexOf(search);
    // if there is a search term, select the first matching result if there is not exact match
    if (search && activeTagIndex === -1 && matchingTags.length) {
      activeTagIndex = 0;
    }
    this.update({matchingTags, activeTagIndex});
    this.dispatchEvent(new CustomEvent(`change`, {
      detail: {
        action: `updateInput`,
        inputText: this.state.inputText,
        matchingTags,
      },
    }));
  }

  _resizeInput() {
    // make the search input width dynamic
    const span = document.createElement(`span`);
    span.className = `mp-tag-selector-search-input-dummy`;
    span.innerText = this.el.querySelector(`.mp-tag-selector-search-input`).value;
    this.el.appendChild(span);
    const buffer = 24;
    this.update({inputWidth: span.offsetWidth + buffer + `px`});
    this.el.removeChild(span);
  }

  _resetActiveTagIndex() {
    this.update({activeTagIndex: -1});
  }

  _removeTag(tagName) {
    this.state.selectedTags.delete(tagName);
    this._resetActiveTagIndex();
    this.dispatchEvent(new CustomEvent(`change`, {detail: {tagName, action: `removeTag`}}));
    requestAnimationFrame(() => this.focus());
  }

  _addTag(tagName) {
    tagName = tagName.trim();
    if (tagName && !this.state.selectedTags.has(tagName)) {
      this.state.selectedTags.add(tagName);
      this.update({inputText:``, inputWidth: MIN_INPUT_WIDTH});
      this._resetActiveTagIndex();
      requestAnimationFrame(() => this.focus());
      this.dispatchEvent(new CustomEvent(`change`, {detail: {tagName, action: `addTag`}}));
    }
  }
});
