/* global describe, it */
import expect from 'expect.js';
import moment from 'moment';

import {
  parseDate,
  formatDate,
  localizedDate,
  normalizeDateStrings,
  relativeToAbsoluteDate,
  dateRangeToUnit,
} from '../../lib/util/date';

const NOW = new Date();
const DATE_FORMAT = `YYYY-MM-DD`;
const DATE_TIME_FORMAT = `YYYY-MM-DDTHH:mm:ss`;
const CURRENT_DATE_ISO = moment(NOW).format(DATE_FORMAT);
const CURRENT_DATE_TIME_ISO = moment(NOW).format(DATE_TIME_FORMAT);

const NON_DATE_INPUTS = [
  ``,
  `Ceci n'est pas une date`,
  null,
  undefined,
  [],
  {},
];

describe(`parseDate`, function() {
  it(`handles date strings of the desired formats`, function() {
    const startOfDec1st2015 = new Date(2015, 11, 1).setHours(0, 0, 0, 0);
    const dec1st2015Formats = [
      `12/01/2015`,
      `12/01/15`,
      `12-01-2015`,
      `12-01-15`,
      `12 01 2015`,
      `12 01 15`,
      `12.01.2015`,
      `12.01.15`,
      `12/1/2015`,
      `12/1/15`,
      `12-1-2015`,
      `12-1-15`,
      `12 1 2015`,
      `12 1 15`,
      `12.1.2015`,
      `12.1.15`,
      `2015/12/01`,
      `15/12/01`,
      `2015-12-01`,
      `15-12-01`,
      `2015 12 01`,
      `15 12 01`,
      `2015.12.01`,
      `15.12.1`,
      `2015/12/1`,
      `15/12/1`,
      `2015-12-1`,
      `15-12-1`,
      `2015 12 1`,
      `15 12 1`,
      `2015.12.1`,
      `15.12.1`,
      `Dec 01 2015`,
      `Dec 01 15`,
      `Dec 01 '15`,
      `Dec 1 2015`,
      `Dec 1 15`,
      `Dec 1 '15`,
      `Dec 1st 2015`,
      `Dec 1st 15`,
      `Dec 1st '15`,
      `December 1 2015`,
      `December 1 15`,
      `December 1 '15`,
      `December 01 2015`,
      `December 01 15`,
      `December 01 '15`,
      `December 1st 2015`,
      `December 1st 15`,
      `December 1st '15`,
    ];

    dec1st2015Formats.forEach(dateString => expect(
      parseDate(dateString).setHours(0, 0, 0, 0)
    ).to.eql(startOfDec1st2015));

    const startOfFeb27th2000 = new Date(2000, 1, 27).setHours(0, 0, 0, 0);
    const feb27th2000Formats = [
      `02/27/2000`,
      `02/27/00`,
      `02-27-2000`,
      `02-27-00`,
      `02 27 2000`,
      `02 27 00`,
      `02.27.2000`,
      `02.27.00`,
      `2/27/2000`,
      `2/27/00`,
      `2-27-2000`,
      `2-27-00`,
      `2 27 2000`,
      `2 27 00`,
      `2.27.2000`,
      `2.27.00`,
      `2000/02/27`,
      `00/02/27`,
      `2000-02-27`,
      `00-02-27`,
      `2000 02 27`,
      `00 02 27`,
      `2000.02.27`,
      `00.02.27`,
      `2000/2/27`,
      `00/2/27`,
      `2000-2-27`,
      `00-2-27`,
      `2000 2 27`,
      `00 2 27`,
      `2000.2.27`,
      `00.2.27`,
      `Feb 27 2000`,
      `Feb 27 00`,
      `Feb 27 '00`,
      `Feb 27 2000`,
      `Feb 27 00`,
      `Feb 27 '00`,
      `Feb 27th 2000`,
      `Feb 27th 00`,
      `Feb 27th '00`,
      `February 27 2000`,
      `February 27 00`,
      `February 27 '00`,
      `February 27 2000`,
      `February 27 00`,
      `February 27 '00`,
      `February 27th 2000`,
      `February 27th 00`,
      `February 27th '00`,
    ];

    feb27th2000Formats.forEach(dateString => expect(
      parseDate(dateString).setHours(0, 0, 0, 0)
    ).to.eql(startOfFeb27th2000));
  });

  it(`parses date strings that don't include year to the most recent past instance of that date`, function() {
    const shorthandDates = {
      '12/01': {month: 12, day: 1 },
      '12-01': {month: 12, day: 1 },
      '12 01': {month: 12, day: 1 },
      '12.01': {month: 12, day: 1 },
      '12/1':  {month: 12, day: 1 },
      '12-1':  {month: 12, day: 1 },
      '12 1':  {month: 12, day: 1 },
      '12.1':  {month: 12, day: 1 },
      'Dec 1':  {month: 12, day: 1 },
      'Dec 1st':  {month: 12, day: 1 },
      'December 1':  {month: 12, day: 1 },
      'December 1st':  {month: 12, day: 1 },
      '02/27': {month: 2,  day: 27},
      '02-27': {month: 2,  day: 27},
      '02 27': {month: 2,  day: 27},
      '02.27': {month: 2,  day: 27},
      '2/27':  {month: 2,  day: 27},
      '2-27':  {month: 2,  day: 27},
      '2 27':  {month: 2,  day: 27},
      '2.27':  {month: 2,  day: 27},
      'Feb 27':  {month: 2,  day: 27},
      'Feb 27th':  {month: 2,  day: 27},
      'February 27':  {month: 2,  day: 27},
      'February 27th':  {month: 2,  day: 27},
      'December 2015': {month: 12, day: 1, year: 2015},
      'Dec 2015': {month: 12, day: 1, year: 2015},
      'December \'15': {month: 12, day: 1, year: 2015},
      'Dec \'15': {month: 12, day: 1, year: 2015},
      'February 2000': {month: 2, day: 1, year: 2000},
      'Feb 2000': {month: 2, day: 1, year: 2000},
      'February \'00': {month: 2, day: 1, year: 2000},
      'Feb \'00': {month: 2, day: 1, year: 2000},
    };

    Object.keys(shorthandDates).forEach(dateString => {
      let date = new Date();
      let {year, month, day} = shorthandDates[dateString];

      date.setMonth(month - 1);
      date.setDate(day - 1);

      if (year) {
        date.setFullYear(year);
      } else if (date > new Date()) {
        date.setFullYear(date.getFullYear() - 1);
      }

      expect(parseDate(dateString))
        .to.eql(date.setHours(0, 0, 0, 0));
    });
  });

  it(`sets date to start of day if 'startOfDay' option is set`, function() {
    expect(parseDate(`12/1/2015`, {startOfDay: false}).setHours(0, 0, 0, 0)).to.eql(new Date(2015, 12 - 1, 1).setHours(0, 0, 0, 0));
    expect(parseDate(`12/1/2015`, {startOfDay: true})).to.eql(new Date(2015, 12 - 1, 1).setHours(0, 0, 0, 0));
  });

  it(`sets date to end of day if 'endOfDay' option is set`, function() {
    expect(parseDate(`12/1/2015`, {endOfDay: false}).setHours(0, 0, 0, 0)).to.eql(new Date(2015, 12 - 1, 1).setHours(0, 0, 0, 0));
    expect(parseDate(`12/1/2015`, {endOfDay: true})).to.eql(new Date(2015, 12 - 1, 1).setHours(23, 59, 59, 999));
  });

  it(`parses date strings that do include a future year to a future date`, function() {
    expect(parseDate(`12/1/9999`).setHours(0, 0, 0, 0)).to.eql(new Date(9999, 12 - 1, 1).setHours(0, 0, 0, 0));
    expect(parseDate(`12/1/9999`, {startOfDay: true})).to.eql(new Date(9999, 12 - 1, 1).setHours(0, 0, 0, 0));
    expect(parseDate(`12/1/9999`, {endOfDay: true})).to.eql(new Date(9999, 12 - 1, 1).setHours(23, 59, 59, 999));
  });

  it(`doesn't reset today's date to a past year`, function() {
    expect(parseDate(CURRENT_DATE_ISO).setHours(0, 0, 0, 0)).to.eql(new Date().setHours(0, 0, 0, 0));
    expect(parseDate(CURRENT_DATE_ISO, {startOfDay: true})).to.eql(new Date().setHours(0, 0, 0, 0));
    expect(parseDate(CURRENT_DATE_ISO, {endOfDay: true})).to.eql(new Date().setHours(23, 59, 59, 999));
  });

  it(`returns null if invalid input is passed`, function() {
    NON_DATE_INPUTS.concat([
      123,
      new Date(),
    ]).forEach(input => expect(parseDate(input)).to.eql(null));
  });
});

describe(`formatDate`, function() {
  it(`formats Date objects and timestamp integers to the expected string format`, function() {
    expect(formatDate(new Date(2015, 11, 1))).to.eql(`Dec 1, 2015`);
    expect(formatDate(1448956800000)).to.eql(`Dec 1, 2015`);

    expect(formatDate(new Date(2000, 1, 27))).to.eql(`Feb 27, 2000`);
    expect(formatDate(951638400000)).to.eql(`Feb 27, 2000`);
  });

  it(`formats Date objects and timestamp integers to the expected string format if the 'iso' option is set`, function() {
    expect(formatDate(new Date(2015, 11, 1), {iso: true})).to.eql(`2015-12-01`);
    expect(formatDate(1448956800000, {iso: true})).to.eql(`2015-12-01`);

    expect(formatDate(new Date(2000, 1, 27), {iso: true})).to.eql(`2000-02-27`);
    expect(formatDate(951638400000, {iso: true})).to.eql(`2000-02-27`);
  });

  it(`formats Date objects and timestamp integers to the expected string format if the 'unit' option is set`, function() {
    let unitDateFormats = {
      'hour': `12am, Tue, Dec 1`,
      'day': `Tue, Dec 1`,
      'week': `Dec 1 - Dec 7`,
      'month': `Dec 2015`,
      'quarter': `Q4 2015`,
      'year': `2015`,
    };
    Object.keys(unitDateFormats).forEach(unit =>
      expect(formatDate(new Date(2015, 11, 1), {unit})).to.eql(unitDateFormats[unit])
    );

    unitDateFormats = {
      'hour': `12am, Sun, Feb 27`,
      'day': `Sun, Feb 27`,
      'week': `Feb 27 - Mar 4`,
      'month': `Feb 2000`,
      'quarter': `Q1 2000`,
      'year': `2000`,
    };
    Object.keys(unitDateFormats).forEach(unit =>
      expect(formatDate(new Date(2000, 1, 27), {unit})).to.eql(unitDateFormats[unit])
    );
  });

  it(`formats Date objects and timestamp integers to the expected string format if the 'unit' and 'displayRangeIfWeek' option is set`, function() {
    expect(formatDate(new Date(2015, 11, 1), {unit: `week`, displayRangeIfWeek: false})).to.eql(`Dec 1`)
    expect(formatDate(new Date(2000, 1, 27), {unit: `week`, displayRangeIfWeek: false})).to.eql(`Feb 27`)
  });

  it(`formats Date objects and timestamp integers to the expected string format if the 'customFormatting' option is set`, function() {
    let customFormatting = {
      'hour': `DDMMYYYY`,
      'day': `MMDDYYYY`,
      'week': `MMDD`,
      'month': `MMMM`,
      'quarter': `QQ`,
      'year': `YYYY YYYY`,
    };

    let unitDateFormats = {
      'hour': `01122015`,
      'day': `12012015`,
      'week': `1201 - 1207`,
      'month': `December`,
      'quarter': `44`,
      'year': `2015 2015`,
    };
    Object.keys(unitDateFormats).forEach(unit =>
      expect(formatDate(new Date(2015, 11, 1), {unit, customFormatting})).to.eql(unitDateFormats[unit])
    );

    unitDateFormats = {
      'hour': `27022000`,
      'day': `02272000`,
      'week': `0227 - 0304`,
      'month': `February`,
      'quarter': `11`,
      'year': `2000 2000`,
    };
    Object.keys(unitDateFormats).forEach(unit =>
      expect(formatDate(new Date(2000, 1, 27), {unit, customFormatting})).to.eql(unitDateFormats[unit])
    );
  });

  it(`returns null if invalid input is passed`, function() {
    NON_DATE_INPUTS.forEach(input => expect(formatDate(input)).to.eql(null));
  });
});

describe(`relativeToAbsoluteDate`, function() {
  it(`converts a relative date integer and a unit to the expected Date object`, function() {
    const testCases = [
      [5, `day`, date => date.setDate(date.getDate() - 5)],
      [5, `month`, date => date.setMonth(date.getMonth() - 5)],
      [5, `year`, date => date.setFullYear(date.getFullYear() - 5)],
      [-100, `day`, date => date.setDate(date.getDate() + 100)],
      [-100, `month`, date => date.setMonth(date.getMonth() + 100)],
      [-100, `year`, date => date.setFullYear(date.getFullYear() + 100)],
      [0, `day`, date => date],
      [0, `month`, date => date],
      [0, `year`, date => date],
    ];

    testCases.forEach(([value, unit, setExpected]) => {
      const actual = relativeToAbsoluteDate(value, unit);
      const expected = new Date();
      setExpected(expected);
      expect(actual.setHours(0, 0, 0, 0)).to.eql(expected.setHours(0, 0, 0, 0));
    });
  });

  it(`returns null if invalid input is passed`, function() {
    const inputs = NON_DATE_INPUTS.concat([new Date()]);

    inputs.forEach(input => expect(relativeToAbsoluteDate(input, input)).to.eql(null));
    inputs.forEach(input => expect(relativeToAbsoluteDate(5, input)).to.eql(null));
    inputs.forEach(input => expect(relativeToAbsoluteDate(input, `day`)).to.eql(null));
  });
});

describe(`normalizeDateStrings`, function() {
  it(`accepts a list of date strings and parses, sorts, and ensures they don't exceed the current moment`, function() {
    const inputDates = [`12/01/2015`, `2000 2 27`, `January 1st 9999`];
    const outputDates = [`2000-02-27`, `2015-12-01`, CURRENT_DATE_ISO];
    expect(normalizeDateStrings(inputDates)).to.eql(outputDates);
  });

  it(`replaces invalid entries in the arguments list with null`, function() {
    const inputs = NON_DATE_INPUTS.concat([
      123,
      new Date(),
    ]);
    normalizeDateStrings(inputs).forEach(output => expect(output).to.eql(null));
  });

  it('allows utc offset to define the current moment', function() {
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    const inputDates = [CURRENT_DATE_TIME_ISO, moment(oneDayFromNow).format(DATE_TIME_FORMAT)];
    const outputDates = [CURRENT_DATE_ISO, moment(oneDayFromNow).format(DATE_FORMAT)];
    const utcOffset = 24 * 60; // include one day of offset hours
    expect(normalizeDateStrings(inputDates, {utcOffset})).to.eql(outputDates);
  });
});

describe(`dateRangeToUnit`, function() {
  it(`accepts from and to dates and returns a unit string which corresponds with the distance between them`, function() {
    let from = new Date();
    let to = new Date();
    expect(dateRangeToUnit(from, to.setDate(to.getDate() + 3))).to.eql(`hour`);

    from = new Date();
    to = new Date();
    expect(dateRangeToUnit(from, to.setDate(to.getDate() + 30))).to.eql(`day`);

    from = new Date();
    to = new Date();
    expect(dateRangeToUnit(from, to.setDate(to.getDate() + 180))).to.eql(`week`);

    from = new Date();
    to = new Date();
    expect(dateRangeToUnit(from, to.setDate(to.getDate() + 1000000))).to.eql(`month`);
  });

  it(`returns null if either input date is invalid`, function() {
    NON_DATE_INPUTS.forEach(input => expect(dateRangeToUnit(input, input)).to.eql(null));
    NON_DATE_INPUTS.forEach(input => expect(dateRangeToUnit(new Date(), input)).to.eql(null));
    NON_DATE_INPUTS.forEach(input => expect(dateRangeToUnit(input, new Date())).to.eql(null));
  });
});

describe(`localizedDate`, function() {
  it(`gives the current time when offsetting by the timezone you are in`, function() {
    expect(localizedDate({utcOffset: -NOW.getTimezoneOffset(), date: NOW})).to.eql(NOW);
  });

  it(`always returns a date `, function() {
    NON_DATE_INPUTS.forEach(input => expect(localizedDate({utcOffset: input, date: input})).to.be.a(Date));
    NON_DATE_INPUTS.forEach(input => expect(localizedDate({utcOffset: input})).to.be.a(Date));
    NON_DATE_INPUTS.forEach(input => expect(localizedDate({date: input})).to.be.a(Date));
  });
});
