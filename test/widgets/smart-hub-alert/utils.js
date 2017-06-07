/* global describe, it */

import expect from 'expect.js';

import insightsQueries from './insights-queries.json';

import {
  mapInsightsQueryToUrlParams,
} from '../../../lib/widgets/smart-hub-alert/utils';

describe(`mapInsightsQueryToUrlParams`, function() {
  insightsQueries.forEach(insightsQuery => {
    it(insightsQuery.description, function() {
      const urlParams = mapInsightsQueryToUrlParams(insightsQuery.query);
      expect(urlParams).to.eql(insightsQuery.urlParams);
    });
  });
});
