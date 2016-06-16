/* global APP_ENV */

import mixpanel from 'mixpanel-browser';
import rollbarConfig from 'rollbar-browser';

const appEnv = typeof APP_ENV !== 'undefined' ? APP_ENV : 'development';

export function initMixpanel(token, instanceName) {
  if (appEnv === 'production') {
    mixpanel.init(token, {persistence: 'localStorage'}, instanceName);
  } else {
    // Project 132990 Mixpanel Dev
    mixpanel.init('9c4e9a6caf9f429a7e3821141fc769b7', {
      debug: true,
      persistence: 'localStorage',
    }, instanceName);
  }
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
