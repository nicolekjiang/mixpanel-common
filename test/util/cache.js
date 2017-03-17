/* global describe, it */
import expect from 'expect.js';

import {
  Cache
} from '../../lib/util/cache';

const INPUTS = [
  `a`,
  `abc`,
  ``,
  `計算機科學只有兩個難點：緩存無效和命名的東西`,
  123,
  0,
  -1,
  1/3,
  3.14159265359,
  Infinity,
  -Infinity,
  null,
  undefined,
  [],
  [1, 2, 3],
  [[], [], []],
  [[1, 2], [1, 2]],
  {},
  {a: 1, b: 2},
  {a: {}, b: {}},
  {a: {a: 1}, b: {b: 2}},
  function () {},
  () => {},
  new Date(),
  new Cache(),

  // ensure there are no problems with methods/properties that
  // may exist on the underlying map object prototype
  `get`,
  `set`,
  `prototype`,
  `length`,
  `size`,
  `call`,
  `apply`,
];

describe(`Cache`, function() {
  it(`can add any type of key/value`, function() {
    const cache = new Cache();

    for (const key of INPUTS) {
      for (const value of INPUTS) {
        cache.add(key, value);
        expect(cache.fetch(key)).to.eql(value);

        // ensure adding the same key multiple times has no effect
        cache.add(key, value);
        expect(cache.fetch(key)).to.eql(value);
      }
    }
  });

  it(`can fetch any type of key/value`, function() {
    const cache = new Cache();

    for (const key of INPUTS) {
      for (const value of INPUTS) {
        cache.remove(key);
        expect(cache.fetch(key)).to.eql(undefined);
        cache.add(key, value);
        expect(cache.fetch(key)).to.eql(value);
      }
    }
  });

  it(`can fetch any type of key/value with a defaultValue of any non-function type supplied`, function() {
    const cache = new Cache();

    for (const key of INPUTS) {
      for (const defaultValue of INPUTS) {
        if (!defaultValue instanceof Function) {
          cache.remove(key)
          expect(cache.fetch(key)).to.eql(undefined);
          expect(cache.fetch(key, defaultValue)).to.eql(defaultValue);
          expect(cache.fetch(key)).to.eql(defaultValue);
        }
      }
    }
  });

  it(`can fetch any type of key/value with a defaultValue function supplied`, function() {
    const cache = new Cache();
    let defaultValueFunc, defaultValueFuncCallCount;

    for (const key of INPUTS) {
      defaultValueFuncCallCount = 0;
      defaultValueFunc = key => {
        defaultValueFuncCallCount++;
        return [key, key];
      };

      cache.remove(key)
      expect(cache.fetch(key)).to.eql(undefined);
      expect(defaultValueFuncCallCount).to.eql(0);

      expect(cache.fetch(key, defaultValueFunc)).to.eql([key, key]);
      expect(defaultValueFuncCallCount).to.eql(1);

      expect(cache.fetch(key)).to.eql([key, key]);
      expect(defaultValueFuncCallCount).to.eql(1);
    }
  });

  it(`can check existence any type of key/value`, function() {
    const cache = new Cache();

    for (const key of INPUTS) {
      for (const value of INPUTS) {
        cache.remove(key);
        expect(cache.has(key)).to.eql(false);
        cache.add(key, value);
        expect(cache.has(key)).to.eql(true);
      }
    }
  });

  it(`can remove any type of key/value`, function() {
    const cache = new Cache();

    for (const key of INPUTS) {
      for (const value of INPUTS) {
        expect(cache.remove(key)).to.eql(false);
        cache.add(key, value);
        expect(cache.remove(key)).to.eql(true);
        expect(cache.remove(key)).to.eql(false);
      }
    }
  });
});
