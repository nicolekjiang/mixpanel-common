import moment from 'moment';

const MS_IN_HOUR = 60 * 60 * 1000;
const MS_IN_DAY = MS_IN_HOUR * 24;
export const MS_BY_UNIT = {
  hour: MS_IN_HOUR,
  day: MS_IN_DAY,
  week: MS_IN_DAY * 7,
  month: MS_IN_DAY * 30,
  quarter: MS_IN_DAY * 90,
  year: MS_IN_DAY * 365,
};

const UNITS = {
  hour: `hour`,
  day: `day`,
  week: `week`,
  month: `month`,
  quarter: `quarter`,
  year: `year`,
};

const UNITS_ARRAY = [
  UNITS.hour,
  UNITS.day,
  UNITS.week,
  UNITS.month,
  UNITS.quarter,
  UNITS.year,
];

const PARSE_DATE_FORMATS = [
  `M D YY`,
  `M D YYYY`,
  `YY M D`,
  `YYYY M D`,
  `MMM D YY`,
  `MMM D YYYY`,
  `MMM Do YY`,
  `MMM Do YYYY`,
  `M D`,
];

const DISPLAY_DATE_FORMATS = {
  'hour': `MMM D[,] ha`,
  'day': `ddd, MMM Do`,
  'week': `MMM D`,
  'month': `MMM YYYY`,
  'quarter': `[Q]Q YYYY`,
  'year': `YYYY`,
};

/**
 * Parse a date string into a Date object (sets date time to start of day)
 * Strings that parse to a future date (i.e. "12/31") are moved to the most recent *past* instance of that date
 * @param {String} dateString - string to parse
 * @param {Boolean} endOfDay - optional; set date time to end of day
 * @returns {Date|null} - the Date object the input string parses to, or null if input is invalid
 */
export function parseDate(dateString, {iso=false, startOfDay=false, endOfDay=false}={}) {
  if (typeof dateString === `string`) {
    let date = null;

    if (iso) {
      date = moment.utc(new Date(dateString));
    } else {
      // replace all chars other than alphanumerics and spaces with a space
      // this allows strings like '"2017-02-02"' to be parsed correctly
      dateString = dateString.replace(/[^\w\s]+/g, ` `);
      date = moment(dateString, PARSE_DATE_FORMATS);
    }

    if (date.isValid()) {
      date = startOfDay ? date.startOf(UNITS.day) : date;
      date = endOfDay ? date.endOf(UNITS.day) : date;

      // make dates like "12/31" parse to the most recent past instance of that date
      date = date > moment() ? date.subtract(1, `years`) : date;

      return new Date(date);
    }
  }

  return null;
}

export function formatDate(date, {iso=false, utc=false, unit=null, customFormatting={}, displayRangeIfWeek=true}={}) {
  date = utc ? moment.utc(Number(date)) : moment(Number(date));

  if (date.isValid()) {
    if (iso) {
      return date.format().slice(0, 10);
    }

    const format = customFormatting[unit] || DISPLAY_DATE_FORMATS[unit] || `MMM D, YYYY`;

    if (displayRangeIfWeek && unit === `week`) {
      return `${date.format(format)} - ${date.add(6, `days`).format(format)}`;
    }

    return date.format(format);
  }

  return null;
}

export function relativeToAbsoluteDate(relativeDateInt, unit) {
  if (Number.isInteger(relativeDateInt) && UNITS_ARRAY.includes(unit)) {
    return new Date(moment().subtract(relativeDateInt, `${unit}s`));
  }

  return null;
}

export function normalizeDateStrings(...dates) {
  const now = new Date();
  return dates
    .map(parseDate)
    .filter(date => date)
    .map(date => date > now ? now : date)
    .map(date => date.getTime())
    .sort((a, b) => a - b)
    .map(date => formatDate(date, {iso: true}));
}

export function dateRangeToUnit(from, to) {
  if ((from instanceof Date || Number.isInteger(from)) &&
    (to instanceof Date || Number.isInteger(to))
  ) {
    from = moment(from);
    to = moment(to);

    if (from.isValid() && to.isValid()) {
      const daysApart = to.diff(from, `days`) + 1;

      if (Number.isInteger(daysApart)) {
        if (daysApart <= 4) {
          return `hour`;
        } else if (daysApart <= 31) {
          return `day`;
        } else if (daysApart <= 183) {
          return `week`;
        } else {
          return `month`;
        }
      }
    }
  }

  return null;
}
