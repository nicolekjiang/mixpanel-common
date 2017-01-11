import expect from 'expect.js';

import {
  stringFilterMatches
} from '../../lib/util/string';

describe('stringFilterMatches', function() {
  it('matches at the beginning of a string', function() {
    expect(stringFilterMatches('abcdefg', 'abc')).to.eql(['abc', 'defg']);
  });

  it('matches in the middle/end of a string', function() {
    expect(stringFilterMatches('abcdefg', 'def')).to.eql(['', 'abc', 'def', 'g']);
    expect(stringFilterMatches('abcdefg', 'efg')).to.eql(['', 'abcd', 'efg', '']);
  });

  it('returns null for non-matches', function() {
    expect(stringFilterMatches('abcdefg', 'ac')).to.eql(null);
  });

  it('is case-insensitive', function() {
    expect(stringFilterMatches('abcdefg', 'dEf')).to.eql(['', 'abc', 'def', 'g']);
    expect(stringFilterMatches('abCDEfg', 'dEF')).to.eql(['', 'abC', 'DEf', 'g']);
  });

  it('ignores whitespace padding', function() {
    expect(stringFilterMatches('abcdefg', '   def')).to.eql(['', 'abc', 'def', 'g']);
    expect(stringFilterMatches('abcdefg', 'abc   ')).to.eql(['abc', 'defg']);
    expect(stringFilterMatches('abcdefg', '  abc ')).to.eql(['abc', 'defg']);
  });

  it('matches when no filter string is passed', function() {
    expect(stringFilterMatches('abcdefg', '')).to.eql(['', 'abcdefg']);
    expect(stringFilterMatches('abcdefg', null)).to.eql(['', 'abcdefg']);
  });

  it('matches when all space-separated terms match', function() {
    expect(stringFilterMatches('abcdefg', 'abc efg')).to.eql(['abc', 'd', 'efg', '']);
    expect(stringFilterMatches('abcdefg', 'abc   efg')).to.eql(['abc', 'd', 'efg', '']);
    expect(stringFilterMatches('abcdefg', '  abc   efg   ')).to.eql(['abc', 'd', 'efg', '']);
  });

  it('matches out of order', function() {
    expect(stringFilterMatches('abcdefg', 'efg abc')).to.eql(['abc', 'd', 'efg', '']);
  });

  it('merges contiguous matches', function() {
    expect(stringFilterMatches('abcdefg', 'efg bcd')).to.eql(['', 'a', 'bcdefg', '']);
  });

  it('does not match when one or more space-separated terms do not match', function() {
    expect(stringFilterMatches('abcdefg', 'abc xxx')).to.eql(null);
  });
});

