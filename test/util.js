import expect from 'expect.js';

import {
  pluralize,
  immutableSplice,
  removeIndex,
  removeValue,
  replaceIndex,
  insertAtIndex,
  truncateMiddle
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

describe('removeIndex()', function() {
  it('removes items by positive index', function() {
    expect(removeIndex(['a', 'b', 'c', 'd', 'e'], 2)).to.eql(['a','b','d','e']);
  });

  it('removes items by negative index', function() {
    expect(removeIndex(['a', 'b', 'c', 'd', 'e'], -2)).to.eql(['a','b','c','e']);
  });

  it('throws an exception if index is out of range', function() {
    expect(() => removeIndex(['a', 'b', 'c', 'd', 'e'], 10)).to.throwException(/IndexError/);
    expect(() => removeIndex(['a', 'b', 'c', 'd', 'e'], -10)).to.throwException(/IndexError/);
  });
});

describe('removeValue()', function() {
  it('removes items by value', function() {
    expect(removeValue(['a', 'b', 'c', 'd', 'e'], 'c')).to.eql(['a', 'b', 'd', 'e']);
  });

  it('throws an exception if value is not present in array', function() {
    expect(() => removeValue(['a', 'b', 'c', 'd', 'e'], '$')).to.throwException(/ValueError/);
  });
});

describe('replaceIndex()', function() {
  it('replaces items by positive index', function() {
    expect(replaceIndex(['a', 'b', 'c', 'd', 'e'], 2, '$')).to.eql(['a', 'b', '$', 'd', 'e']);
  });

  it('replaces items by negative index', function() {
    expect(replaceIndex(['a', 'b', 'c', 'd', 'e'], -2, '$')).to.eql(['a', 'b', 'c', '$', 'e']);
  });

  it('throws an exception if index is out of range', function() {
    expect(() => replaceIndex(['a', 'b', 'c', 'd', 'e'], 10, '$')).to.throwException(/IndexError/);
    expect(() => replaceIndex(['a', 'b', 'c', 'd', 'e'], -10, '$')).to.throwException(/IndexError/);
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
});

describe('truncateMiddle()', function() {
  it('works when string.length is len+1', function() {
    expect(truncateMiddle('frogs', 4)).to.eql('f...');
  })

  it('only truncates if necessary', function() {
    expect(truncateMiddle('mixpanel', 8)).to.eql('mixpanel');
  });

  it('truncates intelligently if length is small', function() {
    expect(truncateMiddle('mixpanel', 2)).to.eql('mi');
  });

  it('returns empty string if length is 0', function() {
    expect(truncateMiddle('mixpanel', 0)).to.eql('');
  });

  it('truncates in middle of long text', function() {
    const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    expect(truncateMiddle(loremIpsum, 20)).to.eql('Lorem ips...laborum.');
  });

  it('handles newlines and whitespace well', function() {
    const whiteSpace = 'Lorem \n ipsum \t dolor \r sit \w amet,';
    expect(truncateMiddle(whiteSpace, 20)).to.eql('Lorem \n i... w amet,');
  });
});
