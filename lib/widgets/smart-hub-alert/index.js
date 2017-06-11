import jsurl from 'jsurl';
import {Component} from 'panel';
import rison from 'rison';
import {registerMPElement} from  '../../util/register-element.js';
import {extend} from '../../util';
import template from './index.jade';
import css from './index.styl';

import {
  funnelsQueryToUrlParams,
  insightsQueryToUrlParams,
  retentionQueryToUrlParams,
} from './utils';

export default registerMPElement(`mp-smart-hub-alert`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      defaultState: {
        projectId: null,
        mixpanelHost: ``,
        isLink: false,
        alert: null,
        alertId: null,
        groupedAlertId: null,
        permalink: ``,
        type: ``,
        hasSentFeedback: false,
        isRead: false,
        isMarkedUseful: false,
        message: ``,
        ingestedTimeStr: ``,
      },
      helpers: {
        handleSendFeedback: (ev, isMarkedUseful) => {
          ev.stopPropagation();
          this.update({hasSentFeedback: true, isMarkedUseful});
          this.dispatchEvent(new CustomEvent(`sentFeedback`, {
            bubbles: true,
            detail: {
              alertId: this.state.alertId,
              groupedAlertId: this.state.groupedAlertId,
              isMarkedUseful,
            },
          }));
        },
        handleRemoveAlert: ev => {
          ev.stopPropagation();
          this.dispatchEvent(new CustomEvent(`removedAlert`, {
            bubbles: true,
            detail: {
              alertId: this.state.alertId,
              groupedAlertId: this.state.groupedAlertId,
            },
          }));
        },
      },
    };
  }

  generateTimeStr(timestampMs) {
    const currentTimestamp = new Date().getTime();
    const timestampDiff = currentTimestamp - timestampMs;
    // TODO(mack): Use moment.js
    if (timestampDiff < 86400000) {
      const units = Math.floor(timestampDiff / 3600000);
      return units === 1 ? `${units} hour ago` : `${units} hours ago`;
    } else {
      const units = Math.floor(timestampDiff / 86400000);
      return units === 1 ? `${units} day ago` : `${units} days ago`;
    }
  }

  /* eslint-disable camelcase */
  generatePermalink(alerts) {
    let firstAlert = alerts[0];
    const projectUrl = `${this.state.mixpanelHost}/report/${this.state.projectId}`;
    const alertContentIds = alerts.map(alert => alert.alertContentId);

    if (firstAlert.insightsQuery) {
      const urlParams = extend(insightsQueryToUrlParams(firstAlert.insightsQuery), {alertContentIds});
      return `${projectUrl}/insights/#${jsurl.stringify(urlParams)}`;
    } else if (firstAlert.funnelsQuery) {
      const funnelsQuery = firstAlert.funnelsQuery;
      // TODO(mack): Consider having startStepIdx be part of the funnelsQuery
      // TODO(mack): Support isOverallConversion
      const startStepIdx = firstAlert.anomaly.funnelsDetails.startStepIdx;
      const urlParams = extend(funnelsQueryToUrlParams(funnelsQuery), {
        alert_content_ids: alertContentIds,
        conversion_overlay_event_index: startStepIdx + 1,
      });
      const urlHash = rison.encode(urlParams);
      return `${projectUrl}/funnels/#view/${funnelsQuery.bookmarkId}/${urlHash.substring(1, urlHash.length - 1)}`;
    } else if (firstAlert.retentionQuery) {
      const urlParams = extend(retentionQueryToUrlParams(firstAlert.retentionQuery), {alert_content_ids: alertContentIds});
      const urlHash = rison.encode(urlParams);
      return `${projectUrl}/retention/#${urlHash.substring(1, urlHash.length - 1)}`;
    }
  }
  /* eslint-enable camelcase */

  updateAlertState() {
    const smartHubAlert = this.state.smartHubAlert;
    if (!smartHubAlert) {
      return;
    }

    let alertId, alertMetadata, groupedAlertId, permalink;
    if (smartHubAlert.alert) {
      const alert = smartHubAlert.alert;
      alertMetadata = alert.alertMetadata;
      alertId = alert.alertId;
      if (this.state.isLink) {
        permalink = this.generatePermalink([alert]);
      }
    } else {
      const groupedAlert = smartHubAlert.groupedAlert;
      alertMetadata = groupedAlert.alertMetadata;
      groupedAlertId = groupedAlert.groupedAlertId;
      if (this.state.isLink) {
        permalink = this.generatePermalink(groupedAlert.alerts);
      }
    }

    this.update({
      smartHubAlert,
      alertId,
      groupedAlertId,
      permalink,
      type: alertMetadata.type,
      isRead: !!alertMetadata.readAtMs,
      isMarkedUseful: !!alertMetadata.markedUsefulAtMs,
      message: alertMetadata.message,
      ingestedTimeStr: this.generateTimeStr(alertMetadata.ingestedAtMs),
    });
  }

  attributeChangedCallback(name, oldValue, value) {
    super.attributeChangedCallback(...arguments);
    if (name === `smart-hub-alert`) {
      this.update({smartHubAlert: this.getJSONAttribute(name)});
    } else if (name === `project-id`) {
      this.update({projectId: Number(value)});
    } else if (name === `mixpanel-host`) {
      this.update({mixpanelHost: value});
    } else if (name === `is-link`) {
      this.update({isLink: this.isAttributeEnabled(name)});
    }
    this.updateAlertState();
  }
});
