/* global describe, it */
import expect from 'expect.js';

import {
  parseDate,
  formatDate,
  normalizeDateStrings,
  relativeToAbsoluteDate,
  dateRangeToUnit,
} from '../../lib/util/date';

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

  it(`handles date strings that don't include year`, function() {
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
    };

    Object.keys(shorthandDates).forEach(dateString => {
      let date = new Date();

      date.setMonth(shorthandDates[dateString].month - 1);
      date.setDate(shorthandDates[dateString].day - 1);

      if (date > new Date()) {
        date.setFullYear(date.getFullYear() - 1);
      }

      expect(parseDate(dateString))
        .to.eql(date.setHours(0, 0, 0, 0));
    });
  });

  it(`returns null if invalid input is passed`, function() {
    NON_DATE_INPUTS.concat([
      123,
      new Date(),
    ]).forEach(input => expect(parseDate(input)).to.eql(null));
  });

  it(`sets date to end of day if 'endOfDay' option is set`, function() {
    expect(parseDate(`12/1/2015`, {endOfDay: false})).to.eql(new Date().setHours(0, 0, 0, 0));
    expect(parseDate(`12/1/2015`, {endOfDay: true})).to.eql(new Date().setHours(23, 59, 59, 999));
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
      'hour': `Dec 1, 12am`,
      'day': `Tue, Dec 1st`,
      'week': `Dec 1 - Dec 7`,
      'month': `Dec 2015`,
      'quarter': `Q4 2015`,
      'year': `2015`,
    };
    Object.keys(unitDateFormats).forEach(unit =>
      expect(formatDate(new Date(2015, 11, 1), {unit})).to.eql(unitDateFormats[unit])
    );

    unitDateFormats = {
      'hour': `Feb 27, 12am`,
      'day': `Sun, Feb 27th`,
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
    let date = new Date();
    expect(relativeToAbsoluteDate(5, `day`)).to.eql(date.setDate(date.getDate() - 5));

    date = new Date();
    expect(relativeToAbsoluteDate(5, `month`)).to.eql(date.setMonth(date.getMonth() - 5));

    date = new Date();
    expect(relativeToAbsoluteDate(5, `year`)).to.eql(date.setFullYear(date.getFullYear() - 5));

    date = new Date();
    expect(relativeToAbsoluteDate(-100, `day`)).to.eql(date.setDate(date.getDate() + 100));

    date = new Date();
    expect(relativeToAbsoluteDate(-100, `month`)).to.eql(date.setMonth(date.getMonth() + 100));

    date = new Date();
    expect(relativeToAbsoluteDate(-100, `year`)).to.eql(date.setFullYear(date.getFullYear() + 100));

    date = new Date();
    expect(relativeToAbsoluteDate(0, `day`)).to.eql(date);

    date = new Date();
    expect(relativeToAbsoluteDate(0, `month`)).to.eql(date);

    date = new Date();
    expect(relativeToAbsoluteDate(0, `year`)).to.eql(date);
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
    const now = new Date();
    const currentDate = [
      now.getFullYear(),
      (`0` + (now.getMonth() + 1)).slice(-2),
      (`0` + now.getDate()).slice(-2),
    ].map(String).join(`-`);
    const inputDates = [`12/01/2015`, `2000 2 27`, `January 1st 9999`];
    const outputDates = [`2000-02-27`, `2015-12-01`, currentDate];
    expect(normalizeDateStrings(...inputDates)).to.eql(outputDates);
  });

  it(`replaces invalid entries in the arguments list with null`, function() {
    const inputs = NON_DATE_INPUTS.concat([
      123,
      new Date(),
    ]);
    normalizeDateStrings(...inputs).forEach(output => expect(output).to.eql(null));
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
