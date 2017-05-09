import {Component} from 'panel';

import {registerMPElement} from '../../util/register-element.js';
import {toSentenceCase} from '../../util/string.js';
import {clickWasOutside} from  '../../util/dom.js';

import template from './index.jade';

import css from './index.styl';

export default registerMPElement(`mp-tag`, class extends Component {
  get config() {
    return {
      useShadowDom: true,
      css,
      template,
      defaultState: {
        sizeClass: `default-tag`,
      },
      helpers: {
        remove: () => this.dispatchEvent(new CustomEvent(`remove`, {detail: {tagName: this.getAttribute(`tag-name`)}})),
        select: e => {
          const removeTag = this.el.querySelector(`.remove-tag`);
          if (!removeTag || clickWasOutside(e, removeTag)) {
            this.dispatchEvent(new CustomEvent(`select`, {detail: {tagName: this.getAttribute(`tag-name`)}}));
          }
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

      this.update({sizeClass});
    }
  }
});
