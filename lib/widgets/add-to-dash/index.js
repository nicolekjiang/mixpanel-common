/* global mixpanel */
import { Component } from 'panel';

import css from './index.styl';
import template from './index.jade';
import { truncateMiddle } from '../../util';
import { sorted } from '../../util/array';
import { registerMPElement } from  '../../util/register-element.js';

const sortedTags = tags => sorted(Array.from(tags), {transform: s => s.toLowerCase()});

const DEFAULT_TAGS = [`project dashboard`, `my dashboard`];

registerMPElement(`add-to-dash`, class extends Component {
  get config() {
    return {
      css,
      template,
      defaultState: {
        editTags: false,
        reportCreated: false,
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

        selectedTags: () => {
          const selectedTags = new Set(this.getJSONAttribute(`selected-tags`) || []);
          return JSON.stringify([...selectedTags]);
        },

        saveTags: e => {
          this.update({savingTags: true});
          this.appApi.patch(
            this._getDashboardApiUrl() + `/` + this.getJSONAttribute(`bookmark`).id,
            JSON.stringify({tags: e.detail.tags})
          ).then(response => {
            this.update({savingTags: false, open: false});
            const updatedReport = response.results;
            mixpanel.track(`[Web Dash] Updated report dashboards`, {
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
          let createDashboard;
          if (this.isAttributeEnabled(`show-tutorial-tooltip`)) {
            this.setAttribute(`show-tutorial-tooltip`, false);
          }
          // add url hash to params to make it easy to navigate back to report from dashboard
          const bookmark = this.getJSONAttribute(`bookmark`);
          const type = this.getAttribute(`report-type`);
          if (!bookmark) {
            if (this.isAttributeEnabled(`over-free-limit`)) {
              this.update({showUpsellModal: true});
              return;
            }
            const params = Object.assign(this.getJSONAttribute(`report-params`), {url_hash: window.location.hash}); // eslint-disable-line camelcase
            const data = JSON.stringify({
              type: type === `segmentation` ? `segmentation3` : type, // when saving a segmentation report to bookmarks the type is actually "segmentation3" in the db
              name: this.getAttribute(`report-name`).substring(0, 255), // limit report name to max of 255 characters
              tags: DEFAULT_TAGS,
              params,
            });
            this.update({initialLoading: true});
            createDashboard = this.appApi.post(this._getDashboardApiUrl(), data);
          // update a bookmark that is not a dashboard yet
          } else if (!bookmark.include_in_dashboard) { // eslint-disable-line camelcase
            this.update({initialLoading: true});
            const data = {
              tags: DEFAULT_TAGS,
            };
            if (!bookmark.params.url_hash) {
              data.params = Object.assign(JSON.parse(bookmark.params), {url_hash: window.location.hash}); // eslint-disable-line camelcase
            }
            createDashboard = this.appApi.patch(
              this._getDashboardApiUrl() + `/` + bookmark.id,
              JSON.stringify(data)
            );
          }
          if (createDashboard) {
            createDashboard.then(response => {
              const newReport = response.results;
              this.setAttribute(`bookmark`, JSON.stringify(Object.assign(newReport, {include_in_dashboard: true}))); // eslint-disable-line camelcase
              this.setAttribute(`selected-tags`, JSON.stringify(sortedTags(DEFAULT_TAGS)));
              this.update({reportCreated: true, initialLoading: false});
              this.dispatchEvent(new CustomEvent(`report-added`));
              mixpanel.track(`[Web Dash] Report added to dashboard`, {
                'report info: name': newReport.name,
                'report info: type': newReport.type,
                'report info: chart type': newReport.chart_type,
              });
            })
            .catch(() => {
              this.update({loadState: `error`});
            });
          }
          this.update({open: true});
        },

        closeUpsellPopup: e => {
          if (e.detail.state === `closed`) {
            this.update({showUpsellModal: false});
          }
        },

        closeTooltip: () => {
          this.setAttribute(`show-tutorial-tooltip`, false);
        },

        closeMenu: () => {
          this.update({open: false, reportCreated: false});
        },

        tagSelectorMenuChanged: e => {
          e.stopPropagation();
          if (e.detail.state === `closed`) {
            this.update({open: false, reportCreated: false});
          }
        },

        tagSelectorChanged: e => {
          if (e.detail.action) {
            const tagName = e.detail.tagName;
            const allTags = this.getJSONAttribute(`all-tags`);
            let selectedTags = this.getJSONAttribute(`selected-tags`);

            // update local tag attributes
            switch (e.detail.action) {
              case `addTag`: {
                if (!allTags.includes(tagName)) {
                  allTags.push(tagName);
                }
                if (!selectedTags.includes(tagName)) {
                  selectedTags.push(tagName);
                }
                break;
              }
              case `removeTag`: {
                selectedTags = selectedTags.filter(tag => tag.toLowerCase() !== tagName.toLowerCase());
                break;
              }
              case `updateInput`: {
                return;
              }
            }
            this.setAttribute(`selected-tags`, JSON.stringify(selectedTags));
            this.setAttribute(`all-tags`, JSON.stringify(allTags));
          }
        },

        maybeTrackHover: () => {
          if (this.getAttribute(`not-implemented`)) {
            mixpanel.track(`[Web Dash] Hover on disabled add-to-dash`, {'Report Type': this.getAttribute(`report-type`)});
          }
        },

        truncateMiddle,
      },
    };
  }

  _getDashboardApiUrl() {
    const host = this.getAttribute(`mixpanel-host`);
    const projectId = this.getAttribute(`project-id`);
    return `${host}/api/app/projects/${projectId}/dashboard-reports`;
  }

  attributeChangedCallback(attr) {
    super.attributeChangedCallback(...arguments);
    if ([`mixpanel-host`, `access-token`].includes(attr)) {
      this.appApi = new AppApi(this.getAttribute(`mixpanel-host`), this.getAttribute(`access-token`));
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


