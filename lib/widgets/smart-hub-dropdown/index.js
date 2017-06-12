import {Component} from 'panel';
import {registerMPElement} from  '../../util/register-element.js';
import template from './index.jade';
import css from './index.styl';

export default registerMPElement(`mp-smart-hub-dropdown`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        mixpanelHost: ``,
        projectId: null,
        alerts: [],
        open: false,
        confirmDeleteOpen: false,
      },
      helpers: {
        clearAllAlerts: e => {
          if (e.detail.action === `confirm`) {
            this.update({alerts: [], open: true});
            this.dispatchEvent(new CustomEvent(`clearAllAlerts`));
          }
        },
        handleDropMenuChange: e => {
          const open = e.detail.state === `open`;
          this.setAttribute(`open`, open);
        },
        handleModalChange: (key, state) => {
          this.state.confirmDeleteOpen = state === `open`;
          this.update();
        },
        handleSentFeedback: e => {
          if (!e.detail.isMarkedUseful) {
            this._removeAlert(e.detail);
          }
        },
        handleRemovedAlert: e => {
          this._removeAlert(e.detail);
        },
        openConfirmDelete: () => this.update({confirmDeleteOpen: true}),
      },
    };
  }

  _removeAlert(params) {
    let alerts;
    if (params.alertId) {
      alerts = this.state.alerts.filter(alert => {
        return !!alert.groupedAlert || alert.alert.alertId !== params.alertId;
      });
    } else {
      alerts = this.state.alerts.filter(alert => {
        return !!alert.alert || alert.groupedAlert.groupedAlertId !== params.groupedAlertId;
      });
    }
    this.update({alerts});
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    // TODO(mack): Check if it's necessary to do this in both attachedCallback and attributeChangedCallback
    // bootstrap the widget's state from attributes
    this.update({
      alerts: this.getJSONAttribute(`alerts`),
      open: this.isAttributeEnabled(`open`),
    });
  }

  attributeChangedCallback(name, oldValue, value) {
    super.attributeChangedCallback(...arguments);
    if (this.initialized) {
      if (name === `open`) {
        const open = this.isAttributeEnabled(`open`);
        this.dispatchEvent(new CustomEvent(`change`, {detail: {open}}));
        this.update({open});
      }
    } else if (name === `mixpanel-host`) {
      this.update({mixpanelHost: value});
    } else if (name === `project-id`) {
      this.update({projectId: Number(value)});
    }
  }
});
