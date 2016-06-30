import expect from 'expect.js';

import {
  pluralize,
  immutableSplice,
  removeIndex,
  removeValue,
  replaceIndex,
  insertAtIndex,
} from '../lib/util';

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

describe('immutableSplice()', function() {
  it('removes items by positive index', function() {
    expect(immutableSplice([1, 2, 3, 4, 5], 1, 2)).to.eql([1, 4, 5]);
  });

  it('removes items by negative index', function() {
    expect(immutableSplice([1, 2, 3, 4, 5], -3, 2)).to.eql([1, 2, 5]);
  });

  it('inserts items by positive index', function() {
    expect(immutableSplice([1, 2, 3, 4, 5], 1, 1, 8, 8)).to.eql([1, 8, 8, 3, 4, 5]);
  });

  it('inserts items by negative index', function() {
    expect(immutableSplice([1, 2, 3, 4, 5], -3, 1, 8, 8)).to.eql([1, 2, 8, 8, 4, 5]);
  });

  it('behaves the same way as Array.prototype.splice when removing', function() {
    let expected, actual;

    for (let start = -3; start < 3; start++) {
      for (let deleteCount = -3; deleteCount < 3; deleteCount++) {
        expected = new Array(5).fill(5);
        actual = expected.slice(0);

        expected.splice(start, deleteCount);
        actual = immutableSplice(actual, start, deleteCount);

        expect(actual).to.eql(expected);
      }
    }
  });

  it('behaves the same way as Array.prototype.splice when inserting', function() {
    let expected, actual, items;

    for (let start = -3; start < 3; start++) {
      for (let deleteCount = -3; deleteCount < 3; deleteCount++) {
        for (let item = -3; item < 3; item++) {
          for (let itemCount = 1; itemCount < 3; itemCount++) {
            expected = new Array(5).fill(5);
            actual = expected.slice(0);
            items = new Array(itemCount).fill(item);

            Array.prototype.splice.apply(expected, [start, deleteCount, ...items]);
            actual = immutableSplice.apply(null, [actual, start, deleteCount, ...items]);

            expect(actual).to.eql(expected);
          }
        }
      }
    }
  });
});

describe('removeIndex()', function() {
  it('removes items by positive index', function() {
    expect(removeIndex([1, 2, 3, 4, 5], 2)).to.eql([1,2,4,5]);
  });

  it('removes items by negative index', function() {
    expect(removeIndex([1, 2, 3, 4, 5], -2)).to.eql([1,2,3,5]);
  });

  it('does not remove anything if index is out of range', function() {
    expect(removeIndex([1, 2, 3, 4, 5], 10)).to.eql([1, 2, 3, 4, 5]);
    expect(removeIndex([1, 2, 3, 4, 5], -10)).to.eql([1, 2, 3, 4, 5]);
  });
});

describe('removeValue()', function() {
  it('removes items by value', function() {
    expect(removeValue([1, 2, 3, 4, 5], 3)).to.eql([1, 2, 4, 5]);
  });

  it('does not remove anything if value is not present in array', function() {
    expect(removeValue([1, 2, 3, 4, 5], 10)).to.eql([1, 2, 3, 4, 5]);
  });
});

describe('replaceIndex()', function() {
  it('replaces items by positive index', function() {
    expect(replaceIndex([1, 2, 3, 4, 5], 2, 8)).to.eql([1, 2, 8, 4, 5]);
  });

  it('replaces items by negative index', function() {
    expect(replaceIndex([1, 2, 3, 4, 5], -2, 8)).to.eql([1, 2, 3, 8, 5]);
  });

  it('does not replace anything if index is out of range', function() {
    expect(replaceIndex([1, 2, 3, 4, 5], 10, 8)).to.eql([1, 2, 3, 4, 5]);
    expect(replaceIndex([1, 2, 3, 4, 5], -10, 8)).to.eql([1, 2, 3, 4, 5]);
  });
});

describe('insertAtIndex()', function() {
  it('inserts items by positive index', function() {
    expect(insertAtIndex([1, 2, 3, 4, 5], 2, 8)).to.eql([1, 2, 8, 3, 4, 5]);
  });

  it('inserts items by negative index', function() {
    expect(insertAtIndex([1, 2, 3, 4, 5], -2, 8)).to.eql([1, 2, 3, 8, 4, 5]);
  });

  it('does not insert anything if index is out of range', function() {
    expect(insertAtIndex([1, 2, 3, 4, 5], 10, 8)).to.eql([1, 2, 3, 4, 5]);
    expect(insertAtIndex([1, 2, 3, 4, 5], -10, 8)).to.eql([1, 2, 3, 4, 5]);
  });
});
