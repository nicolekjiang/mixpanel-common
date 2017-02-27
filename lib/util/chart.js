/**
  * isIncompleteInterval -- Returns true if the last time-period has not been completed 
  *
  * @param {Hash} series A single series, in highcharts format
  * @param {Hash} an options hash.
  *      * (required) 'unit' interval in milliseconds
  *        OR A string describing the interval ('hour', 'day', 'week', 'month')
  *      * (required) 'utcOffset' timezone offset in minutes
  *        OR A string describing the interval ('hour', 'day', 'week', 'month')
  *      * "adjustForLocalTime" This adjusts the estimation for local time.
  * @return {Boolean} true/false
  */
export function isIncompleteInterval(data, options) {
  options = options || {};
  const unit = options.unit;
  if (data && data.length > 0 && unit) {
    let timeInterval;
    const lastPoint = data[data.length - 1];
    const lastDate = Array.isArray(lastPoint) ? lastPoint[0] : lastPoint.x;
    const now = new Date();
    let currentTime = now.getTime();
    let timezoneOffset = options.utcOffset || 0;
    if (options.adjustForLocalTime) {
      // many dates passed in are in the local time of the browser.
      timezoneOffset += now.getTimezoneOffset();
    }
    currentTime = currentTime + 60000 * timezoneOffset;

    const currentInterval = (currentTime - lastDate);
    if (Number.isInteger(unit)) {
      timeInterval = unit;
    } else {
      const msInHour = 60 * 60 * 1000;
      const date = new Date(currentTime); // change date to account for offset
      switch (unit.toLowerCase()) {
        case `hour`:
          timeInterval = msInHour;
          break;
        case `day`:
          timeInterval = 24 * msInHour;
          break;
        case `week`:
          timeInterval = 7 * 24 * msInHour;
          break;
        case `month`:
          var start = new Date(date.getYear(), date.getMonth());
          var end = new Date(date.getYear(), date.getMonth() + 1);
          timeInterval = (end.getTime() - start.getTime());
          break;
        case `quarter`:
          var last = new Date(lastDate);
          var nowMonths = date.getUTCFullYear() * 12 + date.getUTCMonth();
          var lastMonths = last.getUTCFullYear() * 12 + last.getUTCMonth();
          return nowMonths - lastMonths < 3;
        default:
          console.error(`Unknown interval: "${timeInterval}"`);
          return false;
      }
    }

    return currentInterval < timeInterval;
  }
  
  return false;
}
