import jsurl from 'jsurl';
import {Component} from 'panel';
import rison from 'rison';
import {registerMPElement} from  '../../util/register-element.js';
import {extend} from '../../util';
import template from './index.jade';
import css from './index.styl';

import {
  mapFunnelsQueryToUrlParams,
  mapInsightsQueryToUrlParams,
  mapRetentionQueryToUrlParams,
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
        handleNavigateToReport: () => {
          window.location.href = this.state.permalink;
        },
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

  generatePermalink(alerts) {
    let firstAlert = alerts[0];
    const alertContentIds = alerts.map(alert => alert.alertContentId);

    const permalinkPrefix = `${this.state.mixpanelHost}/report/${this.state.projectId}`;
    if (firstAlert.insightsQuery) {
      const urlParams = extend(mapInsightsQueryToUrlParams(firstAlert.insightsQuery), {alertContentIds});
      return `${permalinkPrefix}/insights/#${jsurl.stringify(urlParams)}`;
    } else if (firstAlert.funnelsQuery || firstAlert.retentionQuery) {
      let urlParams, reportName;
      /* eslint-disable camelcase */
      if (firstAlert.funnelsQuery) {
        urlParams = extend(mapFunnelsQueryToUrlParams(firstAlert.funnelsQuery), {alert_content_ids: alertContentIds});
        reportName = `funnels`;
      } else {
        urlParams = mapRetentionQueryToUrlParams(firstAlert.retentionQuery, {alert_content_ids: alertContentIds});
        reportName = `retention`;
      }
      /* eslint-enable camelcase */

      const urlHash = rison.encode(urlParams);
      return `${permalinkPrefix}/${reportName}/#${urlHash.substring(1, urlHash.length - 1)}`;
    }
  }

  updateStateFromAlert(smartHubAlert) {
    let alertId, alertMetadata, groupedAlertId, permalink;
    if (smartHubAlert.alert) {
      const alert = smartHubAlert.alert;
      alertMetadata = alert.alertMetadata;
      alertId = alert.alertId;
      permalink = this.generatePermalink([alert]);
    } else {
      const groupedAlert = smartHubAlert.groupedAlert;
      alertMetadata = groupedAlert.alertMetadata;
      groupedAlertId = groupedAlert.groupedAlertId;
      permalink = this.generatePermalink(groupedAlert.alerts);
    }
    this.update({
      alert: smartHubAlert,
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
    if (name === `alert`) {
      const alert = this.getJSONAttribute(`alert`);
      this.updateStateFromAlert(alert);
    } else if (name === `project-id`) {
      this.update({projectId: Number(value)});
    } else if (name === `mixpanel-host`) {
      this.update({mixpanelHost: value});
    }
  }
});
