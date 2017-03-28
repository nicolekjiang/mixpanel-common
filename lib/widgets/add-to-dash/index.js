/* global mixpanel */
import { Component } from 'panel';

import css from './index.styl';
import template from './index.jade';
import { initMixpanel } from '../../report/tracking-setup';
import { truncateMiddle } from '../../util';
import { sorted } from '../../util/array';
import { registerMPElement } from  '../../util/register-element.js';

const sortedTags = tags => sorted(Array.from(tags), {transform: s => s.toLowerCase()});

const DEFAULT_TAGS = [`project dashboard`, `my dashboard`];
export default registerMPElement(`add-to-dash`, class extends Component {
  get config() {
    return {
      css,
      template,
      defaultState: {
        editTags: false,
        open: false,
        savingTags: false,
        showUpsellModal: false,
        loadState: false,
        initialLoading: false,
      },
      useShadowDom: true,
      helpers: {
        editTags: () => this.update({editTags: true}),
        allTags: () => {
          const allTags = new Set(this.getJSONAttribute(`all-tags`) || []);
          [`project dashboard`, `my dashboard`, `product`, `marketing`, `growth`].forEach(t => allTags.add(t));
          return JSON.stringify(sortedTags(allTags));
        },

        saveTags: e => {
          this.update({savingTags: true});
          this.appApi.patch(
            this._getDashboardApiUrl() + `/` + this.getJSONAttribute(`bookmark`).id,
            JSON.stringify({tags: e.detail.tags})
          ).then(response => {
            this.update({savingTags: false, open: false});
            const updatedReport = response.results;
            this._track(`Updated report dashboards`, {
              'updated dashboards': updatedReport.tags,
              '# of dashboards after update': updatedReport.tags.length,
              'source': `add report`,
            });
            // fire off an event in case the parent cares about this change
            this.dispatchEvent(new CustomEvent(`tags-saved`, {detail: {
              bookmarkId: parseInt(this.getJSONAttribute(`bookmark`).id),
              selectedTags: e.detail.tags,
            }}));
          }).catch(() => {
            this.update({tagSaveError: true});
          });
        },

        openMenu: () => {
          this.update({editTags: false});
          if (this.isAttributeEnabled(`show-tutorial-tooltip`)) {
            this.setAttribute(`show-tutorial-tooltip`, false);
          }

          if (!this.isAttributeEnabled(`bookmark`)) {
            // this implies we need to create a new bookmark
            if (this.isAttributeEnabled(`over-free-limit`)) {
              this.update({showUpsellModal: true});
              return;
            }
          }

          this.update({open: true, initialLoading: true});

          const existingBookmark = this.getJSONAttribute(`bookmark`);
          let addToDash;
          if (existingBookmark) {
            addToDash = this._ensureBookmarkIsDashReport(existingBookmark);
          } else {
            addToDash = this.saveBookmark().then(bookmark => this._ensureBookmarkIsDashReport(bookmark));
          }

          if (addToDash) {
            addToDash
              .then(bookmark => {
                this.setAttribute(`bookmark`, JSON.stringify(bookmark)); // eslint-disable-line camelcase
                this.update({ initialLoading: false });
                this.dispatchEvent(new CustomEvent(`report-added`, {detail: {updatedBookmark: bookmark}}));
                let chartType = bookmark.chart_type;
                if (!chartType && bookmark.params) {
                  const params = JSON.parse(bookmark.params);
                  if (params && params.displayOptions) {
                    chartType = params.displayOptions.chartType;
                  }
                }

                this._track(`Report added to dashboard`, {
                  'report info: name': bookmark.name,
                  'report info: type': bookmark.type,
                  'report info: chart type': chartType,
                });
              })
              .catch(error => {
                this.update({loadState: `error`});
                console.warn(error);
              });
          } else {
            this.update({editTags: true, initialLoading: false});
          }

        },

        closeUpsellPopup: e => {
          if (e.detail.state === `closed`) {
            this.update({showUpsellModal: false});
          }
        },

        closeTooltip: () => {
          this.setAttribute(`show-tutorial-tooltip`, false);
          this.dispatchEvent(new CustomEvent(`tutorial-tooltip-closed`));
        },

        closeMenu: () => {
          this.update({open: false});
        },

        tagSelectorMenuChanged: e => {
          e.stopPropagation();
          if (e.detail.state === `closed`) {
            this.update({open: false});
          }
        },

        tagSelectorChanged: e => {
          const action = e.detail.action;
          if ([`addTag`, `removeTag`].includes(action)) {
            const op = action === `addTag` ? `add` : `delete`;
            this.state.selectedTags[op](e.detail.tagName);
            this.update();
          }
        },

        maybeTrackHover: () => {
          if (this.getAttribute(`not-implemented`)) {
            this._track(`Hover on disabled add-to-dash`, {'Report Type': this.getAttribute(`tracking-report-type`)});
          }
        },

        truncateMiddle,
      },
    };
  }

  // this is separated out so that the caller can override if they need to do
  // something different (like we do on insights)
  saveBookmark() {
    const type = this.getAttribute(`report-type`);
    const name = this.getAttribute(`report-name`);
    const params = this.getJSONAttribute(`report-params`);
    if ([type, name, params].includes(null)) {
      throw Error(`'report-type', 'report-name', and 'report-params' attributes are required to create new dashboard reports`);
    }
    const data = JSON.stringify({
      type: type === `segmentation` ? `segmentation3` : type, // when saving a segmentation report to bookmarks the type is actually "segmentation3" in the db
      name: name.substring(0, 255), // limit report name to max of 255 characters
      params,
    });
    return this.appApi.post(this._getDashboardApiUrl(), data).then(resp => resp.results);
  }

  _ensureBookmarkIsDashReport(bookmark) {
    if (!bookmark.include_in_dashboard) {
      const data = {tags: DEFAULT_TAGS};
      return this.appApi.patch(
        this._getDashboardApiUrl() + `/` + bookmark.id,
        JSON.stringify(data)
      ).then(resp => {
        bookmark.include_in_dashboard = true; // eslint-disable-line camelcase
        bookmark.tags = resp.results.tags;
        return bookmark;
      });
    }
  }

  _track(eventName, properties) {
    const tracking = this.state.tracking || [];
    if (tracking) {
      tracking.forEach(trackingObj => {
        const eventPrefix = trackingObj[`event-prefix`] || ``;
        const alias = trackingObj.alias;
        if (mixpanel[alias]) {
          mixpanel[alias].track(`${eventPrefix} ${eventName}`, properties);
        }
      });
    } else {
      mixpanel.track(`${eventName}`, properties);
    }
  }

  _getDashboardApiUrl() {
    const host = this.getAttribute(`mixpanel-host`);
    const projectId = this.getAttribute(`project-id`);
    return `${host}/api/app/projects/${projectId}/dashboard-reports`;
  }

  attachedCallback() {
    super.attachedCallback(...arguments);
    if (this.getAttribute(`tracking`)) {
      const tracking = this.getJSONAttribute(`tracking`).filter(t => !!t.token);
      tracking.forEach((trackingObj, idx) => {
        const alias = trackingObj[`event-prefix`] || idx.toString();
        trackingObj.alias = alias;
        if (!mixpanel[alias]) {
          initMixpanel(trackingObj.token, alias);
        }
      });

      this.update({ tracking });
    }
  }

  attributeChangedCallback(attr) {
    super.attributeChangedCallback(...arguments);
    switch (attr) {
      case `mixpanel-host`:
      case `access-token`:
        this.appApi = new AppApi(this.getAttribute(`mixpanel-host`), this.getAttribute(`access-token`));
        break;
      case `bookmark`: {
        const bookmark = this.getJSONAttribute(`bookmark`) || {};
        const tags = bookmark.tags || [];
        this.update({selectedTags: new Set(tags)});
        break;
      }
    }
  }
});

class AppApi {
  constructor(mixpanelHost, accessToken) {
    this.refreshTokenUrl = `${mixpanelHost}/oauth/access_token/`;
    this.accessToken = accessToken;
  }

  _getNewAccessToken() {
    return fetch(this.refreshTokenUrl, {credentials: `include`})
      .then(response => {
        if (response.status >= 500) {
          return {'error': response.statusText};
        } else {
          return response.json();
        }
      }).then(response => {
        if (response.token) {
          this.accessToken = response.token;
        }
      });
  }

  _doRequest(url, params, refreshAccessTokenIfInvalid) {
    const _params = Object.assign({headers: {'Authorization': `Bearer ${this.accessToken}`}}, params);
    return fetch(url, _params)
      .then(response => {
        if (response.status >= 500) {
          throw Error(response.statusText);
        } else if (response.status === 401 && refreshAccessTokenIfInvalid) {
          // refresh access token
          return this._getNewAccessToken().then(() => {
            return this._doRequest(url, params, false);
          });
        } else {
          return response.json();
        }
      });
  }

  post(url, data) {
    const params = {
      body: data,
      method: `POST`,
    };

    return this._doRequest(url, params, true);
  }

  patch(url, data) {
    const params = {
      body: data,
      method: `PATCH`,
    };

    return this._doRequest(url, params, true);
  }
}
