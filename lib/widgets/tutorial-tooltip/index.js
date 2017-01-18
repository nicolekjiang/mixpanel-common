import { Component } from 'panel';
import { registerMPElement } from  '../../util/register-element.js';
import template from './index.jade';
import css from './index.styl';

registerMPElement(`mp-tutorial-tooltip`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        placement: `top`,
        numSteps: 0,
        currStep: 0,
        overrideStyles: {},
      },
      helpers: {
        getSteps: () => [...Array(this.state.numSteps).keys()],
      },
    };
  }

  attachedCallback() {
    super.attachedCallback();

    let update = {};

    if (this.hasAttribute(`placement`)) {
      update.placement = this.getAttribute(`placement`);
    }

    const overrides = {
      top: this.getAttribute(`overrideTop`),
      bottom: this.getAttribute(`overrideBottom`),
      left: this.getAttribute(`overrideLeft`),
      right: this.getAttribute(`overrideRight`),
    };

    [`top`, `bottom`, `left`, `right`].forEach(attr => {
      if (overrides[attr]) {
        update.overrideStyles = update.overrideStyles || {};
        update.overrideStyles[attr] = overrides[attr];
      }
    });

    [`numSteps`, `currStep`].forEach(attr => {
      const value = parseInt(this.getAttribute(attr));
      if (Number.isInteger(value)) {
        update[attr] = value;
      }
    });

    this.update(update);
  }
});
