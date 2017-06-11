import {Component} from 'panel';
import {registerMPElement} from  '../../util/register-element.js';
import template from './index.jade';
import css from './index.styl';

export default registerMPElement(`mp-smart-hub-tooltip`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        alert: null,
        placement: `top`,
      },
      helpers: {
        handleRemovedAlert: () => {
          // TODO(mack): Should we remove the anomaly from the report, and close this tooltip?
        },
      },
    };
  }

  attributeChangedCallback(name, oldValue, value) {
    super.attributeChangedCallback(...arguments);
    if (name === `alert`) {
      this.update({alert: this.getJSONAttribute(name)});
    } else if (name === `placement`) {
      this.update({placement: value});
    }
  }
});
