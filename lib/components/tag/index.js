import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';
import { toSentenceCase } from  '../../util/string.js';

import template from './index.jade';

import css from './index.styl';

registerMPElement(`mp-tag`, class extends Component {
  get config() {
    return {
      useShadowDom: true,
      css,
      template,
      helpers: {
        remove: e => {
          e.stopPropagation();
          this.dispatchEvent(new CustomEvent(`change`, {detail: {action: `remove`}}));
        },
        toSentenceCase: tagName => toSentenceCase(tagName),
      },
    };
  }
});
