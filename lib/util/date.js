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
  [UNITS.hour]: `MMM D[,] ha`,
  [UNITS.day]: `ddd, MMM Do`,
  [UNITS.week]: `MMM D`,
  [UNITS.month]: `MMM YYYY`,
  [UNITS.quarter]: `[Q]Q YYYY`,
  [UNITS.year]: `YYYY`,
};

/**
 * Parse a date string into a Date object (sets date time to start of day)
 * Strings that parse to a future date (i.e. "12/31") are moved to the most recent *past* instance of that date
 * @param {string} dateString - string to parse
 * @param {boolean} [iso] - treat input date string as an ISO-formatted UTC date (i.e. "2017-02-28")
 * @param {boolean} [startOfDay] - set date time to start of day
 * @param {boolean} [endOfDay] - set date time to end of day
 * @returns {?Date} - the Date object the input string parses to, or null if input is invalid
 */
export function parseDate(dateString, {iso=false, startOfDay=false, endOfDay=false}={}) {
  let date = null;
  let mDate;

  if (typeof dateString === `string`) {
    if (iso) {
      mDate = moment.utc(new Date(dateString));
    } else {
      // replace all chars other than alphanumerics and spaces with a space
      // this allows strings like '"2017-02-02"' to be parsed correctly
      dateString = dateString.replace(/[^\w\s]+/g, ` `);
      mDate = moment(dateString, PARSE_DATE_FORMATS);
    }

    if (mDate.isValid()) {
      mDate = startOfDay ? mDate.startOf(UNITS.day) : mDate;
      mDate = endOfDay ? mDate.endOf(UNITS.day) : mDate;

      // make dates like "12/31" parse to the most recent past instance of that date
      const partialYear = mDate.format(`YY`);
      const month = mDate.format(`MM`);
      const day = mDate.format(`DD`);
      if (!dateString.replace(month, ``).replace(day, ``).includes(partialYear)) { // was the year specified?
        mDate = mDate > moment().endOf(UNITS.day) ? mDate.subtract(1, `${UNITS.year}s`) : mDate;
      }

      date = new Date(mDate);
    }
  }

  return date;
}

/**
 * Convert a Date object or integer timestamp into a formatted date string
 * @param {date|number} date - Date object or timestamp to format
 * @param {boolean} [iso] - format date to ISO-style string (YYYY-MM-DD)
 * @param {boolean} [utc] - treat input as a UTC date
 * @param {string} [unit] - use the corresponding format for this unit from DISPLAY_DATE_FORMATS
 * @param {Object} [customFormatting] - map of units to custom format strings to be used in place of DISPLAY_DATE_FORMATS
 * @param {boolean} [displayRangeIfWeek] - if unit is week format to range string across week (i.e. "Dec 1 - Dec 7")
 * @returns {?string} - the string the input Date object formats to, or null if input is invalid
 */
export function formatDate(date, {iso=false, utc=false, unit=null, customFormatting={}, displayRangeIfWeek=true}={}) {
  let dateString = null;
  let mDate;

  if (date instanceof Date || Number.isInteger(date)) {
    mDate = utc ? moment.utc(Number(date)) : moment(Number(date));

    if (mDate.isValid()) {
      if (iso) {
        dateString = mDate.format().slice(0, 10);
      } else {
        const format = customFormatting[unit] || DISPLAY_DATE_FORMATS[unit] || `MMM D, YYYY`;

        if (displayRangeIfWeek && unit === UNITS.week) {
          const from = mDate.format(format);
          const to = mDate.add(6, `${UNITS.day}s`).format(format);
          dateString = `${from} - ${to}`;
        } else {
          dateString = mDate.format(format);
        }
      }
    }
  }

  return dateString;
}

/**
 * Convert a "relative date" integer (i.e. 5 [days ago]) and a unit into an "absolute" Date object
 * @param {number} relativeDateInt - integer that (along with unit) represnts a time offfset from the current date
 * @param {string} unit - specifies the unit of time to multiply the relativeDateInt by to calculate the absolute date
 * @returns {?Date} - the Date object the given relative date integer and unit resolve to, or null if input is invalid
 */
export function relativeToAbsoluteDate(relativeDateInt, unit) {
  let date = null;

  if (Number.isInteger(relativeDateInt) && UNITS_ARRAY.includes(unit)) {
    date = new Date(moment().subtract(relativeDateInt, `${unit}s`));
  }

  return date;
}

/**
 * Accepts a list of date strings and
 * - ensures none of them exceed the current moment
 * - sorts them in ascending order
 * - formats them as ISO date strings (YYYY-MM-DD)
 * @param {Array.<string>} dates - list of date strings to normalize, can be any format that parseDate accepts
 * @returns {Array.<?string>} - list of ISO-formatted normalized date strings, or null if the corresponding input date was invalid
 */
export function normalizeDateStrings(...dates) {
  const now = new Date();
  return dates
    .map(parseDate)
    .filter(Boolean)
    .map(date => date > now ? now : date)
    .map(date => date.getTime())
    .sort((a, b) => a - b)
    .map(date => formatDate(date, {iso: true}));
}

/**
 * Returns a unit string corresponding with the time delta between two Dates
 * @param {Date|number} from - the starting date of the range - can be Date or timestamp
 * @param {Date|number} to - the ending date of the range - can be Date or timestamp
 * @returns {?string} - one of DATE_UNITS that the input range corresponds with, or null if the input was invalid
 */
export function dateRangeToUnit(from, to) {
  let unit = null;

  if (
    (from instanceof Date || Number.isInteger(from)) &&
    (to instanceof Date || Number.isInteger(to))
  ) {
    from = moment(from);
    to = moment(to);

    if (from.isValid() && to.isValid()) {
      const daysApart = to.diff(from, `${UNITS.day}s`) + 1;

      if (Number.isInteger(daysApart)) {
        if (daysApart <= 4) {
          unit = UNITS.hour;
        } else if (daysApart <= 31) {
          unit = UNITS.day;
        } else if (daysApart <= 183) {
          unit = UNITS.week;
        } else {
          unit = UNITS.month;
        }
      }
    }
  }

  return unit;
}
