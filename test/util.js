import expect from 'expect.js';

import {
  pluralize,
  immutableSplice,
  removeByIndex,
  removeByValue,
  replaceByIndex,
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
    expect(immutableSplice(['a', 'b', 'c', 'd', 'e'], 1, 2)).to.eql(['a', 'd', 'e']);
  });

  it('removes items by negative index', function() {
    expect(immutableSplice(['a', 'b', 'c', 'd', 'e'], -3, 2)).to.eql(['a', 'b', 'e']);
  });

  it('inserts items by positive index', function() {
    expect(immutableSplice(['a', 'b', 'c', 'd', 'e'], 1, 1, '$', '*')).to.eql(['a', '$', '*', 'c', 'd', 'e']);
  });

  it('inserts items by negative index', function() {
    expect(immutableSplice(['a', 'b', 'c', 'd', 'e'], -3, 1, '$', '*')).to.eql(['a', 'b', '$', '*', 'd', 'e']);
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

describe('removeByIndex()', function() {
  it('removes items by positive index', function() {
    expect(removeByIndex(['a', 'b', 'c', 'd', 'e'], 2)).to.eql(['a','b','d','e']);
  });

  it('removes items by negative index', function() {
    expect(removeByIndex(['a', 'b', 'c', 'd', 'e'], -2)).to.eql(['a','b','c','e']);
  });

  it('throws an exception if index is out of range', function() {
    expect(() => removeByIndex(['a', 'b', 'c', 'd', 'e'], 10)).to.throwException(/IndexError/);
    expect(() => removeByIndex(['a', 'b', 'c', 'd', 'e'], -10)).to.throwException(/IndexError/);
  });
});

describe('removeByValue()', function() {
  it('removes items by value', function() {
    expect(removeByValue(['a', 'b', 'c', 'd', 'e'], 'c')).to.eql(['a', 'b', 'd', 'e']);
  });

  it('throws an exception if value is not present in array', function() {
    expect(() => removeByValue(['a', 'b', 'c', 'd', 'e'], '$')).to.throwException(/ValueError/);
  });
});

describe('replaceByIndex()', function() {
  it('replaces items by positive index', function() {
    expect(replaceByIndex(['a', 'b', 'c', 'd', 'e'], 2, '$')).to.eql(['a', 'b', '$', 'd', 'e']);
  });

  it('replaces items by negative index', function() {
    expect(replaceByIndex(['a', 'b', 'c', 'd', 'e'], -2, '$')).to.eql(['a', 'b', 'c', '$', 'e']);
  });

  it('throws an exception if index is out of range', function() {
    expect(() => replaceByIndex(['a', 'b', 'c', 'd', 'e'], 10, '$')).to.throwException(/IndexError/);
    expect(() => replaceByIndex(['a', 'b', 'c', 'd', 'e'], -10, '$')).to.throwException(/IndexError/);
  });
});

describe('insertAtIndex()', function() {
  it('inserts items by positive index', function() {
    expect(insertAtIndex(['a', 'b', 'c', 'd', 'e'], 2, '$')).to.eql(['a', 'b', '$', 'c', 'd', 'e']);
  });

  it('inserts items by negative index', function() {
    expect(insertAtIndex(['a', 'b', 'c', 'd', 'e'], -2, '$')).to.eql(['a', 'b', 'c', '$', 'd', 'e']);
  });

  it('throws an exception if index is out of range', function() {
    expect(() => insertAtIndex(['a', 'b', 'c', 'd', 'e'], 10, '$')).to.throwException(/IndexError/);
    expect(() => insertAtIndex(['a', 'b', 'c', 'd', 'e'], -10, '$')).to.throwException(/IndexError/);
  });

  it('appends item if given index === array.length', function() {
    const array = ['a', 'b', 'c', 'd', 'e'];
    expect(insertAtIndex(array, array.length, '$')).to.eql(['a', 'b', 'c', 'd', 'e', '$']);
  });
});
