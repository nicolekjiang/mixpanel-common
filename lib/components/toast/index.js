import {Component} from 'panel';

import {registerMPElement} from  '../../util/register-element.js';

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
        ctaClick: () => this._triggerAction(),
        closeClick: () => this._triggerClose(),
      },
    };
  }

  _triggerAction() {
    //TODO: remove 'change' event when notifications 3 updates to panel 0.10
    this.dispatchEvent(new CustomEvent(`change`, {detail: {action: `action`}}));
    this.dispatchEvent(new CustomEvent(`action`));
  }

  _triggerClose() {
    //TODO: remove 'change' event when notifications 3 updates to panel 0.10
    this.dispatchEvent(new CustomEvent(`change`, {detail: {action: `close`}}));
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
