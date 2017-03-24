/* global beforeEach, describe, it */
import expect from 'expect.js';
import padStart from 'lodash/padStart';

import '../../lib/components/calendar';

describe(`Test mp-calendar`, function() {
  beforeEach(function() {
    this.navigateCalendar = ({year=null, month=null}={}) => {
      if (year !== null) {
        const yearSelectEl = this.calendar.el.querySelector(`.pika-select-year`);
        yearSelectEl.value = year;
        yearSelectEl.dispatchEvent(new Event(`change`, {bubbles: true}));
      }
      if (month !== null) {
        const monthSelectEl = this.calendar.el.querySelector(`.pika-select-month`);
        monthSelectEl.value = month - 1;
        monthSelectEl.dispatchEvent(new Event(`change`, {bubbles: true}));
      }
    };

    this.clickCalendarDate = ({year, month, day}={}) => {
      this.navigateCalendar({year, month});
      const dayEl = this.calendar.el.querySelector(
        `[data-pika-year="${year}"][data-pika-month="${month - 1}"][data-pika-day="${day}"]`
      );
      dayEl.dispatchEvent(new MouseEvent(`mousedown`, {bubbles: true}));
    };

    this.verifyDayEl = (el, {year, day, month}) => {
      expect(el.getAttribute(`data-pika-year`)).to.equal(year.toString());
      expect(el.getAttribute(`data-pika-month`)).to.equal((month - 1).toString());
      expect(el.getAttribute(`data-pika-day`)).to.equal(day.toString());
    };

    this.verifySelectedDate = date => {
      if (date) {
        expect(this.calendar.getAttribute(`selected-date`)).to.equal(
          `${date.year}-${padStart(date.month, 2, 0)}-${padStart(date.day, 2, 0)}`
        );
      } else {
        expect(this.calendar.getAttribute(`selected-date`)).to.equal(null);
      }

      const selectedDays = this.calendar.el.querySelectorAll(`td[aria-selected="true"] .pika-day`);
      if (date) {
        expect(selectedDays.length).to.equal(1);
        this.verifyDayEl(selectedDays[0], date);
      } else {
        expect(selectedDays.length).to.equal(0);
      }
    };

    this.verifySelectedRange = (fromDate, toDate) => {
      const selectedFromDate = this.calendar.getAttribute(`selected-from-date`);
      const startRangeEl = this.calendar.el.querySelector(`.is-startrange .pika-day`);
      if (fromDate) {
        expect(selectedFromDate).to.equal(`${fromDate.year}-${padStart(fromDate.month, 2, 0)}-${padStart(fromDate.day, 2, 0)}`);
        this.verifyDayEl(startRangeEl, fromDate);
      } else {
        expect(selectedFromDate).to.equal(null);
        expect(startRangeEl).to.equal(null);
      }

      const selectedToDate = this.calendar.getAttribute(`selected-to-date`);
      const endRangeEl = this.calendar.el.querySelector(`.is-endrange .pika-day`);
      if (toDate) {
        expect(selectedToDate).to.equal(`${toDate.year}-${padStart(toDate.month, 2, 0)}-${padStart(toDate.day, 2, 0)}`);
        this.verifyDayEl(endRangeEl, toDate);
      } else {
        expect(selectedToDate).to.equal(null);
        expect(endRangeEl).to.equal(null);
      }

      const inRangeEls = this.calendar.el.querySelectorAll(`.is-inrange .pika-day`);
      if (fromDate && toDate) {
        // This function should only be used if fromDate and toDate are the same month
        expect(fromDate.year === toDate.year && fromDate.month === toDate.month).to.be.equal(true);

        if (fromDate.day !== toDate.day) {
          expect(inRangeEls.length).to.equal(toDate.day - fromDate.day - 1);
        } else {
          expect(inRangeEls.length).to.equal(0);
        }
      } else {
        expect(inRangeEls.length).to.equal(0);
        if (fromDate || toDate) {
          expect(this.calendar.el.querySelectorAll(`.incomplete-range`).length).to.equal(1);
        }
      }
    };

    this.resetCalendar = (attributes, cb) => {
      if (this.calendar) {
        this.calendar.parentNode.removeChild(this.calendar);
      }
      
      document.body.innerHTML = ``;
      this.calendar = document.createElement(`mp-calendar`);
      Object.keys(attributes).forEach(key => this.calendar.setAttribute(key, attributes[key]));
      document.body.appendChild(this.calendar);
      window.requestAnimationFrame(() => cb());
    };
  });

  describe(`setting attributes`, function() {
    it(`setting min-date`, function(done) {
      this.resetCalendar({'min-date': `2017-01-05`}, () => {
        this.navigateCalendar({year: 2017, month: 1});
        const disabledDayEls = this.calendar.el.querySelectorAll(`td.is-disabled:not(.has-event) .pika-day`);
        this.verifyDayEl(disabledDayEls[disabledDayEls.length - 1], {year: 2017, month: 1, day: 4});
        done();
      });
    });

    it(`setting max-date`, function(done) {
      this.resetCalendar({'max-date': `2017-01-25`}, () => {
        this.navigateCalendar({year: 2017, month: 1});
        const disabledDayEls = this.calendar.el.querySelectorAll(`td.is-disabled.has-event .pika-day`);
        this.verifyDayEl(disabledDayEls[0], {year: 2017, month: 1, day: 26});
        done();
      });
    });
  });

  describe(`updating attributes`, function() {
    it(`updating selected-date`, function() {
      this.calendar.setAttribute(`selected-date`, `2017-01-15`);
      this.navigateCalendar({year: 2017, month: 1, day: 15});
      this.verifySelectedDate({year: 2017, month: 1, day: 15});
    });

    it(`updating selected-from-date`, function(done) {
      this.resetCalendar({'is-range': true}, () => {
        this.calendar.setAttribute(`selected-from-date`, `2017-01-15`);
        this.navigateCalendar({year: 2017, month: 1});
        this.verifySelectedRange({year: 2017, month: 1, day: 15}, null);
        done();
      });
    });

    it(`updating selected-from-date and selected-to-date`, function(done) {
      this.resetCalendar({'is-range': true}, () => {
        this.calendar.setAttribute(`selected-from-date`, `2017-01-15`);
        this.calendar.setAttribute(`selected-to-date`, `2017-01-20`);
        this.navigateCalendar({year: 2017, month: 1});
        this.verifySelectedRange({year: 2017, month: 1, day: 15}, {year: 2017, month: 1, day: 20});
        done();
      });
    });
  });

  describe(`single date`, function() {
    beforeEach(function(done) {
      this.resetCalendar({}, done);
    });

    it(`day not selected`, function() {
      const selectedDays = this.calendar.el.querySelectorAll(`td[aria-selected="true"] .pika-day`);
      expect(selectedDays.length).to.equal(0);
    });

    describe(`selected-date is set`, function() {
      beforeEach(function() {
        this.clickCalendarDate({year: 2017, month: 1, day: 15});
      });

      it(`is correct`, function() {
        this.verifySelectedDate({year: 2017, month: 1, day: 15});
      });

      it(`updates selected-date when date is selected`, function() {
        this.verifySelectedDate({year: 2017, month: 1, day: 15});
        this.clickCalendarDate({year: 2017, month: 1, day: 16});
        this.verifySelectedDate({year: 2017, month: 1, day: 16});
      });
    });
  });

  describe(`date range`, function() {
    beforeEach(function(done) {
      this.resetCalendar({'is-range': true}, done);
    });

    it(`no days selected`, function() {
      this.verifySelectedRange(null, null);
    });

    describe(`selected-from-date is set`, function() {
      beforeEach(function() {
        this.clickCalendarDate({year: 2017, month: 1, day: 15});
      });

      it(`is correct`, function() {
        this.verifySelectedRange({year: 2017, month: 1, day: 15}, null);
      });

      it(`swaps dates when choosing date that is before selected-from-date`, function() {
        this.verifySelectedRange({year: 2017, month: 1, day: 15}, null);
        this.clickCalendarDate({year: 2017, month: 1, day: 10});
        this.verifySelectedRange({year: 2017, month: 1, day: 10}, {year: 2017, month: 1, day: 15});
      });
    });

    describe(`selected-from-date and selected-to-date are set`, function() {
      beforeEach(function() {
        this.clickCalendarDate({year: 2017, month: 1, day: 15});
        this.clickCalendarDate({year: 2017, month: 1, day: 20});
      });

      it(`clears previous selected-from-date and selected-to-date when new date is selected`, function() {
        this.verifySelectedRange({year: 2017, month: 1, day: 15}, {year: 2017, month: 1, day: 20});
        this.clickCalendarDate({year: 2017, month: 1, day: 16});
        this.verifySelectedRange({year: 2017, month: 1, day: 16}, null);
      });
    });
  });

  describe(`is-from-date-focused/is-to-date-focused is set`, function() {
    beforeEach(function(done) {
      this.resetCalendar({
        'is-range': true,
        'selected-from-date': `2017-01-10`,
        'selected-to-date': `2017-01-15`,
      }, done);
    });

    describe(`is-from-date-focused is set`, function() {
      beforeEach(function() {
        this.calendar.setAttribute(`is-from-date-focused`, true);
      });

      it(`selecting new date sets selected-from-date`, function() {
        this.verifySelectedRange({year: 2017, month: 1, day: 10}, {year: 2017, month: 1, day: 15});
        this.clickCalendarDate({year: 2017, month: 1, day: 9});
        this.verifySelectedRange({year: 2017, month: 1, day: 9}, {year: 2017, month: 1, day: 15});
      });

      it(`selecting new date that is after selected-to-date sets selected-from-date and selected-to-date`, function() {
        this.verifySelectedRange({year: 2017, month: 1, day: 10}, {year: 2017, month: 1, day: 15});
        this.clickCalendarDate({year: 2017, month: 1, day: 16});
        this.verifySelectedRange({year: 2017, month: 1, day: 16}, {year: 2017, month: 1, day: 16});
      });
    });

    describe(`is-to-date-focused is set`, function() {
      beforeEach(function() {
        this.calendar.setAttribute(`is-to-date-focused`, true);
      });

      it(`selecting new date sets selected-to-date`, function() {
        this.verifySelectedRange({year: 2017, month: 1, day: 10}, {year: 2017, month: 1, day: 15});
        this.clickCalendarDate({year: 2017, month: 1, day: 16});
        this.verifySelectedRange({year: 2017, month: 1, day: 10}, {year: 2017, month: 1, day: 16});
      });

      it(`selecting new date that is before selected-from-date sets selected-from-date and selected-to-date`, function() {
        this.verifySelectedRange({year: 2017, month: 1, day: 10}, {year: 2017, month: 1, day: 15});
        this.clickCalendarDate({year: 2017, month: 1, day: 9});
        this.verifySelectedRange({year: 2017, month: 1, day: 9}, {year: 2017, month: 1, day: 9});
      });
    });
  });
});
