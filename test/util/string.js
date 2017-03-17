/* global describe, it */
import expect from 'expect.js';

import {
  nameToInitials,
  stringFilterMatches,
  toSentenceCase,
} from '../../lib/util/string';

describe(`stringFilterMatches`, function() {
  it(`matches at the beginning of a string`, function() {
    expect(stringFilterMatches(`abcdefg`, `abc`)).to.eql([`abc`, `defg`]);
  });

  it(`matches in the middle/end of a string`, function() {
    expect(stringFilterMatches(`abcdefg`, `def`)).to.eql([``, `abc`, `def`, `g`]);
    expect(stringFilterMatches(`abcdefg`, `efg`)).to.eql([``, `abcd`, `efg`, ``]);
  });

  it(`returns null for non-matches`, function() {
    expect(stringFilterMatches(`abcdefg`, `ac`)).to.eql(null);
  });

  it(`is case-insensitive`, function() {
    expect(stringFilterMatches(`abcdefg`, `dEf`)).to.eql([``, `abc`, `def`, `g`]);
    expect(stringFilterMatches(`abCDEfg`, `dEF`)).to.eql([``, `abC`, `DEf`, `g`]);
  });

  it(`ignores whitespace padding`, function() {
    expect(stringFilterMatches(`abcdefg`, `   def`)).to.eql([``, `abc`, `def`, `g`]);
    expect(stringFilterMatches(`abcdefg`, `abc   `)).to.eql([`abc`, `defg`]);
    expect(stringFilterMatches(`abcdefg`, `  abc `)).to.eql([`abc`, `defg`]);
  });

  it(`matches when no filter string is passed`, function() {
    expect(stringFilterMatches(`abcdefg`, ``)).to.eql([``, `abcdefg`]);
    expect(stringFilterMatches(`abcdefg`, null)).to.eql([``, `abcdefg`]);
  });

  it(`matches when all space-separated terms match`, function() {
    expect(stringFilterMatches(`abcdefg`, `abc efg`)).to.eql([`abc`, `d`, `efg`, ``]);
    expect(stringFilterMatches(`abcdefg`, `abc   efg`)).to.eql([`abc`, `d`, `efg`, ``]);
    expect(stringFilterMatches(`abcdefg`, `  abc   efg   `)).to.eql([`abc`, `d`, `efg`, ``]);
  });

  it(`matches out of order`, function() {
    expect(stringFilterMatches(`abcdefg`, `efg abc`)).to.eql([`abc`, `d`, `efg`, ``]);
  });

  it(`merges contiguous matches`, function() {
    expect(stringFilterMatches(`abcdefg`, `efg bcd`)).to.eql([``, `a`, `bcdefg`, ``]);
  });

  it(`does not match when one or more space-separated terms do not match`, function() {
    expect(stringFilterMatches(`abcdefg`, `abc xxx`)).to.eql(null);
  });
});

describe(`toSentenceCase`, function() {
  it(`capitalizes the first word with one word input`, function() {
    expect(toSentenceCase(`apple`)).to.eql(`Apple`);
  });

  it(`capitalizes only the first word in multi-word input`, function() {
    expect(toSentenceCase(`ice cream`)).to.eql(`Ice cream`);
  });

  it(`produces a string when given a number`, function() {
    expect(toSentenceCase(101)).to.eql(`101`);
  });

  it(`capitalizes single letter input`, function() {
    expect(toSentenceCase(`a`)).to.eql(`A`);
  });

  it(`converts all letters but the first to lowercase`, function() {
    expect(toSentenceCase(`CHOCOLATE CAKE`)).to.eql(`Chocolate cake`);
  });

  it(`produces the empty string on null input`, function() {
    expect(toSentenceCase(null)).to.eql(``);
  });  
});

describe(`nameToInitials`, function() {
  it(`returns one initial when the name is only one word`, function() {
    expect(nameToInitials(`Cassie`)).to.eql(`C`);
  });

  it(`returns both initials for a first name and last name`, function() {
    expect(nameToInitials(`Cassie Morford`)).to.eql(`CM`);
  });

  it(`returns uppercase initials for a lowercase name`, function() {
    expect(nameToInitials(`cassandra raven morford`)).to.eql(`CM`);
  });

  it(`returns two initials for a very long name`, function() {
    expect(nameToInitials(`King Eric (The Real One) The Fourth`)).to.eql(`KF`);
  });

  it(`returns empty string on null`, function() {
    expect(nameToInitials(null)).to.eql(``);
  });

  it(`returns empty string on undefined`, function() {
    expect(nameToInitials(undefined)).to.eql(``);
  });

});


