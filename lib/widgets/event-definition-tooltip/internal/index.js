import {Component} from 'panel';

import {registerMPElement} from  '../../../util/register-element.js';

import timing from '../../../stylesheets/mixins/timing.json.js';

import template from './index.jade';

import css from './index.styl';

export default registerMPElement(`mp-event-definition-tooltip-internal`, class extends Component {
  get config() {
    return {
      css,
      template,
      defaultState: {
        delayRemove: timing[`mp-fast`],
        open: false,
      },
      useShadowDom: true,
    };
  }

  attachedCallback() {
    if (!this.elementMoved) {
      this.elementMoved = true;
      document.body.appendChild(this);
    }

    super.attachedCallback(...arguments);
  }

  detachedCallback() {
    if (this.initialized) {
      super.detachedCallback(...arguments);
    }
  }

  attributeChangedCallback(name) {
    super.attributeChangedCallback(...arguments);
    if (name === `event-definition`) {
      const eventDefinition = this.getJSONAttribute(`event-definition`);
      if (eventDefinition) {
        this.update({name: eventDefinition.name, description: eventDefinition.description});
      }
    } else if (name === `open`) {
      this.update({open: this.isAttributeEnabled(`open`)});
    }
  }
});
