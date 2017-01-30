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
      },
      helpers: {
        getSteps: () => [...Array(this.state.numSteps).keys()],
      },
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    this.updateArrowOffset();
  }


  attributeChangedCallback() {
    super.attributeChangedCallback(...arguments);

    let update = {};
    const placement = this.getAttribute(`placement`);
    const numSteps = parseInt(this.getAttribute(`num-steps`));
    const currStep = parseInt(this.getAttribute(`curr-step`));

    if (placement) {
      update.placement = placement;
    }
    if (Number.isInteger(numSteps)) {
      update.numSteps = numSteps;
    }
    if (Number.isInteger(currStep)) {
      update.currStep = currStep;
    }

    this.update(update);

    this.updateArrowOffset();
  }

  updateArrowOffset() {
    var arrowOffset = parseInt(this.getAttribute(`arrow-offset`));
    if (Number.isInteger(arrowOffset)) {
      var arr = this.el.querySelector(`.arrow`);
      if(!arr) {
        return;
      }
      switch(this.state.placement) {
        case `top`:
        case `bottom`:
          arr.style.left = (arrowOffset - 5) + `px`;
          break;
        case `left`:
        case `right`:
          arr.style.top = (arrowOffset - 5) + `px`;
      }
    }
  }
});
