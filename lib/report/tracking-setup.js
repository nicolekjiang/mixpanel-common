/* global APP_ENV */

/*
 * Env-aware tracking initialization utils
 *
 * Inject APP_ENV via global var or build tools (Webpack DefinePlugin)
 *
 * Recommended usage: create a separate module that initializes
 * the libs and exports the instances:
 *
 * export const mixpanel = initMixpanel('MY MIXPANEL PUBLISHABLE TOKEN');
 * export const rollbar = initRollbar('MY ROLLBAR PUBLISHABLE TOKEN');
 *
 */

import mixpanel from 'mixpanel-browser';
import rollbarConfig from 'rollbar-browser';

const appEnv = typeof APP_ENV !== `undefined` ? APP_ENV : `development`;

export function initMixpanel(token, instanceName, jsLibOpts={}) {
  const config = {
    persistence: `localStorage`,
  };

  if (appEnv !== `production`) {
    token = `9c4e9a6caf9f429a7e3821141fc769b7`; // Project 132990 Mixpanel Dev
    config.debug = true;

    // if the current host is a devbox or staging server, tell the js lib to use
    // it as the app and api host for js lib requests instead of using production
    // Note: we cannot rely on APP_ENV since a js app can be running on any host
    // (e.g. stand-alone mode)
    const host = window.location.host;
    const hostIsDevOrStage = /([a-zA-Z0-9]+)(.dev)?.mixpanel.(com|org)/.test(host);
    if (hostIsDevOrStage) {
      Object.assign(config, {
        app_host: host, // eslint-disable-line camelcase
        app_api: host, // eslint-disable-line camelcase
      });
    }
  }

  mixpanel.init(token, Object.assign(config, jsLibOpts), instanceName);
  return mixpanel;
}

export function initRollbar(token) {
  return rollbarConfig.init({
    accessToken: token,
    captureUncaught: true,
    payload: {
      environment: appEnv,
    },
  });
}
