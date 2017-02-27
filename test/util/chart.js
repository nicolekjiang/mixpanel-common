/* global beforeEach, afterEach, describe, it */

import lolex from 'lolex';
import expect from 'expect.js';
import chartData from './chart-fixtures.json';
import { isIncompleteInterval } from '../../lib/util/chart.js';

describe(`isIncompleteInterval`, function() {
  beforeEach(function() {
    this.data = JSON.parse(JSON.stringify(chartData));
    this.clock = lolex.install();
    this.lastDate = this.data[this.data.length - 1][0]; // 2017-02-15T00:00:00.000Z
  });

  afterEach(function() {
    this.clock.uninstall();
  });

  it(`returns false when a null or undefined unit is provided`, function() {
    expect(isIncompleteInterval(this.data, {})).to.equal(false);
    expect(isIncompleteInterval(this.data, { unit: null })).to.equal(false);
  });

  it(`returns true when there is an incomplete day's worth of data`, function() {
    this.clock.tick(this.lastDate);
    expect(isIncompleteInterval(this.data, { unit: `day` })).to.equal(true);
  });

  it(`returns false when the data is a more than one day old`, function() {
    const msInMoreADay = 1000 * 60 * 60 * 24;
    this.clock.tick(this.lastDate + msInMoreADay * 1.2);
    expect(isIncompleteInterval(this.data, { unit: `day` })).to.equal(false);
  });

  it(`correctly adjusts for local time`, function() {
    // adjustment for local time is 8 hours, default UTC offset is 0
    const timezoneOffsetInMins = new Date().getTimezoneOffset();
    const msInAMin = 1000 * 60;
    this.clock.tick(this.lastDate - msInAMin * (timezoneOffsetInMins - 30));
    expect(isIncompleteInterval(this.data, { adjustForLocalTime: true, unit: `hour` })).to.equal(true);

    this.clock.tick(msInAMin * 60);
    expect(isIncompleteInterval(this.data, { adjustForLocalTime: true, unit: `hour` })).to.equal(false);
  });

  it(`correctly adjusts for combination of UTC offset and local time`, function() {
    // adjustment for local time is 8 hours (480 min)
    const timezoneOffsetInMins = new Date().getTimezoneOffset();
    const msInAMin = 1000 * 60;
    this.clock.tick(this.lastDate);
    expect(isIncompleteInterval(this.data, { utcOffset: -timezoneOffsetInMins, adjustForLocalTime: true, unit: `hour` })).to.equal(true);

    this.clock.tick(msInAMin * 60);
    expect(isIncompleteInterval(this.data, { utcOffset: -timezoneOffsetInMins, adjustForLocalTime: true, unit: `hour` })).to.equal(false);
  });

  it(`returns true when we're in the middle of a week`, function() {
    const msInADay = 1000 * 60 * 60 * 24;
    this.clock.tick(this.lastDate + msInADay * 3);
    expect(isIncompleteInterval(this.data, { unit: `week` })).to.equal(true);
  });

  it(`returns false when we're looking at a previous week`, function() {
    const msInADay = 1000 * 60 * 60 * 24;
    this.clock.tick(this.lastDate + msInADay * 8);
    expect(isIncompleteInterval(this.data, { unit: `week` })).to.equal(false);
  });  

  it(`returns true when we're in the middle of a month`, function() {
    const msInAWeek = 1000 * 60 * 60 * 24 * 7;
    this.clock.tick(this.lastDate + msInAWeek);
    expect(isIncompleteInterval(this.data, { unit: `month` })).to.equal(true);
  });

  it(`returns false when we're looking at a month gone by`, function() {
    const msInAWeek = 1000 * 60 * 60 * 24 * 7;
    this.clock.tick(this.lastDate + msInAWeek * 5);
    expect(isIncompleteInterval(this.data, { unit: `month` })).to.equal(false);
  });

  it(`returns true when we're in the middle of a quarter`, function() {
    const msInAMonth = 1000 * 60 * 60 * 24 * 30;
    this.clock.tick(this.lastDate + msInAMonth * 2);
    expect(isIncompleteInterval(this.data, { unit: `quarter` })).to.equal(true);
  });

  it(`returns false when we're looking at a quarter four months ago`, function() {
    const msInAMonth = 1000 * 60 * 60 * 24 * 30;
    this.clock.tick(this.lastDate + msInAMonth * 4);
    expect(isIncompleteInterval(this.data, { unit: `quarter` })).to.equal(false);
  });

});
