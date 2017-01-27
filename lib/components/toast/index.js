import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';

import css from './index.styl';

registerMPElement(`mp-toast`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      helpers: {
        ctaClick: () => this.dispatchEvent(new CustomEvent(`action`)),
        closeClick: () => this._triggerClose(),
      },
    };
  }

  _triggerClose() {
    this.dispatchEvent(new CustomEvent(`close`));
  }

  attachedCallback() {
    super.attachedCallback();
    this.addEventListener(`action`, e => {
      if (!e.defaultPrevented) {
        this._triggerClose();
      }
    }, true);
  }

});
