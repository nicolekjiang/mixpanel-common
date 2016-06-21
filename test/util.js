import expect from 'expect.js';

import { pluralize } from '../lib/util';

describe('pluralize()', function() {
  it('defaults to adding s', function() {
    expect(pluralize('day', 3)).to.equal('days');
  });

  it('does not pluralize singulars', function() {
    expect(pluralize('wombat', 1)).to.equal('wombat');
  });
});
