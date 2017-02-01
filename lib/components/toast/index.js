import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';

import css from './index.styl';

import timing from '../../stylesheets/mixins/timing.json';

registerMPElement(`mp-toast`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        delayRemove: timing[`mp-fast`],
      },
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
