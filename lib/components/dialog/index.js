import {Component} from 'panel';

import {registerMPElement} from  '../../util/register-element.js';

import timing from '../../stylesheets/mixins/timing.json.js';

import template from './index.jade';

import css from './index.styl';

import throttle from 'lodash/throttle';

export default registerMPElement(`mp-dialog`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        delayRemove: timing[`mp-fast`],
        fullscreen: false,
        open: false,
      },
      helpers: {
        handleDialogInserted: () => {
          this.dispatchEvent(new CustomEvent(`change`, {detail: {state: `open`}}));
        },
        handleDialogRemoved: () => {
          this.dispatchEvent(new CustomEvent(`change`, {detail: {state: `closed`}}));
        },
        closeClicked: () => {
          this.close();
        },
      },
    };
  }

  close() {
    this.update({open: false});
  }

  open() {
    this.update({open: true});
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    // listen for escape keypress
    this.maybeCloseOnEscape = e => {
      if (this.isAttributeEnabled(`closeable`) && e.keyCode === 27) {
        this.close();
      }
    };

    this.setFullscreen = throttle(() => {
      const fullscreen = document.body.clientHeight > window.innerHeight;
      this.update({fullscreen});
    }, 500);
    this.setFullscreen();

    window.addEventListener(`resize`, this.setFullscreen);
    document.body.addEventListener(`keydown`, this.maybeCloseOnEscape);
    if (this.isAttributeEnabled(`open`)) {
      this.open();
    }
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    window.removeEventListener(`resize`, this.setFullscreen);
    document.body.removeEventListener(`keydown`, this.maybeCloseOnEscape);
  }

  attributeChangedCallback(name) {
    super.attributeChangedCallback(...arguments);
    if (this.initialized && name === `open`) {
      if (this.isAttributeEnabled(`open`)) {
        this.open();
      } else {
        this.close();
      }
    }
  }
});
