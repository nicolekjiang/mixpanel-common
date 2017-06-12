import {Component} from 'panel';
import {registerMPElement} from  '../../../util/register-element';

import timing from '../../../stylesheets/mixins/timing.json.js';
import {formatDate} from '../../../util/date';
import template from './index.jade';
import css from './index.styl';

export default registerMPElement(`mp-event-definition-tooltip-internal`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        delayRemove: timing[`mp-fast`],
        open: false,
      },
      helpers: {
        getVerifiedText: () => {
          const nameParts = this.state.verifiedBy.split(` `);
          const verifier = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.` : this.state.verifiedBy;
          const customFormatting = {day: `M/D/YYYY`};
          return `This event was verified by ${verifier} on ${formatDate(this.state.verifiedDate, {utc: true, unit: `day`, customFormatting})}`;
        },
      },
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

  attributeChangedCallback(attr) {
    super.attributeChangedCallback(...arguments);
    switch(attr) {
      case `event-definition`:
        var eventDefinition = this.getJSONAttribute(`event-definition`);
        if (eventDefinition) {
          const {name, description, verified, isMixpanelDefinition, verifiedBy, verifiedDate} = eventDefinition;
          this.update({name, description, verified, isMixpanelDefinition, verifiedBy, verifiedDate: new Date(verifiedDate)});
        }
        break;
      case `open`:
        this.update({open: this.isAttributeEnabled(`open`)});
        break;
    }
  }
});
