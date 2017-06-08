/* global beforeEach, describe, it, sinon */

import expect from 'expect.js';

import funnelsQueries from './funnels-queries.json';
import insightsQueries from './insights-queries.json';
import retentionQueries from './retention-queries.json';

import {
  funnelsQueryToUrlParams,
  insightsQueryToUrlParams,
  retentionQueryToUrlParams,
} from '../../../lib/widgets/smart-hub-alert/utils';

describe(`funnelsQueryToUrlParams`, function() {
  funnelsQueries.forEach(funnelsQuery => {
    beforeEach(function() {
      sinon.useFakeTimers((new Date(2017, 4, 25)).getTime());
    });

    it(funnelsQuery.description, function() {
      const urlParams = funnelsQueryToUrlParams(funnelsQuery.query);
      expect(urlParams).to.eql(funnelsQuery.urlParams);
    });
  });
});

describe(`insightsQueryToUrlParams`, function() {
  insightsQueries.forEach(insightsQuery => {
    it(insightsQuery.description, function() {
      const urlParams = insightsQueryToUrlParams(insightsQuery.query);
      expect(urlParams).to.eql(insightsQuery.urlParams);
    });
  });
});

describe(`retentionQueryToUrlParams`, function() {
  retentionQueries.forEach(retentionQuery => {
    beforeEach(function() {
      sinon.useFakeTimers((new Date(2017, 4, 25)).getTime());
    });

    it(retentionQuery.description, function() {
      const urlParams = retentionQueryToUrlParams(retentionQuery.query);
      expect(urlParams).to.eql(retentionQuery.urlParams);
    });
  });
});
