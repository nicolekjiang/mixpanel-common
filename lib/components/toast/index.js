import { Component } from 'panel';

import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';

import css from './index.styl';

export default registerMPElement(`mp-toast`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        delayRemove: 250, // TODO replace this with "mp-fast" from stylesheets/mixins/timing.json
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
