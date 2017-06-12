import {Component} from 'panel';

import {registerMPElement} from  '../../util/register-element.js';
import './internal';

import template from './index.jade';

/**
 * We don't know the exact height of the tooltip at the time we position it, so this serves as an approximate placeholder.
 * Although this leads to imperfect vertical centering, it prevents the tooltip's vertical position from changing based
 * on its height, which is desired behavior.
 */
const TOOLTIP_HEIGHT_IN_PX = 165;

export default registerMPElement(`mp-event-definition-tooltip`, class extends Component {
  get config() {
    return {
      template,
      useShadowDom: true,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    this.tooltip = document.createElement(`mp-event-definition-tooltip-internal`);
    this.tooltip.setAttribute(`url`, this.getAttribute(`lexicon-url`) || `#`);
    document.body.appendChild(this.tooltip);
    this.positionElement = this.previousSibling;
  }

  detachedCallback() {
    document.body.removeChild(this.tooltip);
    super.detachedCallback(...arguments);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(...arguments);
    if (this.tooltip) {
      this.tooltip.setAttribute(name, newValue);
    }
    if (name === `event-definition`) {
      if (this.getJSONAttribute(`event-definition`) && this.positionElement) {
        const rect = this.positionElement.getBoundingClientRect();
        this.tooltip.style.left = `${rect.left + rect.width + document.body.scrollLeft + 10}px`;
        this.tooltip.style.top = `${rect.top + rect.height / 2 - TOOLTIP_HEIGHT_IN_PX / 2 + document.body.scrollTop}px`;
      }
    }
  }
});
