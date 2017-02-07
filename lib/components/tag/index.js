import { Component } from 'panel';

import { registerMPElement } from '../../util/register-element.js';
import { toSentenceCase } from '../../util/string.js';

import template from './index.jade';

import css from './index.styl';

registerMPElement(`mp-tag`, class extends Component {
  get config() {
    return {
      useShadowDom: true,
      css,
      template,
      defaultState: {
        sizeClass: `default-tag`,
      },
      helpers: {
        remove: e => {
          e.stopPropagation();
          this.dispatchEvent(new CustomEvent(`change`, {detail: {action: `remove`}}));
        },
        toSentenceCase,
      },
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    const sizeAttr = this.getAttribute(`size`);
    if (sizeAttr) {
      let sizeClass = `default-tag`;
      switch (sizeAttr) {
        case `small`:
          sizeClass = `small-tag`;
          break;
      }

      this.update({ sizeClass });
    }
  }
});
