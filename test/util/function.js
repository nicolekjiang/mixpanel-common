/* global describe, it */
import expect from 'expect.js';

import {
  leqToNumericOrdering,
  mapArguments,
  lexicalCompose,
  defaultOrdering
} from '../../lib/util/function';

describe(`leqToNumericOrdering`, function() {
  it(`Turns < to -1, == to 0, > to 1`, function() {
    let myLeq = (a,b) => a[0] <= b[0];
    let myOrd = leqToNumericOrdering(myLeq);
    expect([myOrd([0], [1]), myOrd([0], [0]), myOrd([1], [0])]).to.eql([-1, 0, 1])
  });
});

describe(`defaultOrdering`, function() {
  it(`orders based on simple <=`, function() {
    expect([defaultOrdering(0, 1), defaultOrdering(0, 0), defaultOrdering(1, 0)]).to.eql([-1, 0, 1])
  });
});

describe(`mapArguments`, function() {
  it(`maps all argument`, function() {
    let getArgs = function(...args) { return args };
    expect(getArgs(1,2,3)).to.eql([1,2,3]);
    expect(mapArguments(getArgs, n => 2*n)(1,2,3)).to.eql([2,4,6]);
  });
});

describe(`lexicalCompose`, function() {
  it(`implements a lexical ordering`, function() {
    let myOrd = lexicalCompose(
      mapArguments(defaultOrdering, x => x[0]),
      mapArguments(defaultOrdering, x => x[1])
    );
    
    expect([
      [1,1],
      [1,2],
      [2,1],
      [0,10]
    ].sort(myOrd)).to.eql([[0,10],[1,1],[1,2],[2,1]]);
  });
});
