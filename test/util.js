import expect from 'expect.js';

import { pluralize } from '../lib/util';

describe('pluralize()', function() {
  it('defaults to adding s', function() {
    expect(pluralize('day', 3)).to.equal('days');
  });

  it('does not pluralize singulars', function() {
    expect(pluralize('wombat', 1)).to.equal('wombat');
  });

  it('pluralizes 0 of something', function() {
    expect(pluralize('helicopter', 0)).to.equal('helicopters');
  });

  it('uses third argument to pluralize', function() {
    expect(pluralize('die', 4, 'dice')).to.equal('dice');
  });
});
