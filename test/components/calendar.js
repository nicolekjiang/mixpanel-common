/* eslint-env jasmine, mocha */
import expect from 'expect.js';
import padStart from 'lodash/padStart';
import moment from 'moment';

import '../../lib/components/calendar';

describe(`Test mp-calendar`, function() {
  beforeEach(function() {
    this.navigateCalendar = date => {
      const yearSelectEl = this.calendar.el.querySelector(`.pika-select-year`);
      yearSelectEl.value = date.year();
      yearSelectEl.dispatchEvent(new Event(`change`, {bubbles: true}));

      const monthSelectEl = this.calendar.el.querySelector(`.pika-select-month`);
      monthSelectEl.value = date.month();
      monthSelectEl.dispatchEvent(new Event(`change`, {bubbles: true}));
    };

    this.clickCalendarDate = date => {
      this.navigateCalendar(date);
      const dayEl = this.calendar.el.querySelector(
        `[data-pika-year="${date.year()}"][data-pika-month="${date.month()}"][data-pika-day="${date.date()}"]`
      );
      dayEl.dispatchEvent(new MouseEvent(`mousedown`, {bubbles: true}));
    };

    this.verifyDayEl = (el, date) => {
      expect(el.getAttribute(`data-pika-year`)).to.equal(date.year().toString());
      expect(el.getAttribute(`data-pika-month`)).to.equal(date.month().toString());
      expect(el.getAttribute(`data-pika-day`)).to.equal(date.date().toString());
    };

    this.verifySelectedDate = date => {
      if (date) {
        expect(this.calendar.getAttribute(`selected-date`)).to.equal(
          `${date.year()}-${padStart(date.month() + 1, 2, 0)}-${padStart(date.date(), 2, 0)}`
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
        expect(selectedFromDate).to.equal(`${fromDate.year()}-${padStart(fromDate.month() + 1, 2, 0)}-${padStart(fromDate.date(), 2, 0)}`);
        this.verifyDayEl(startRangeEl, fromDate);
      } else {
        expect(selectedFromDate).to.equal(null);
        expect(startRangeEl).to.equal(null);
      }

      const selectedToDate = this.calendar.getAttribute(`selected-to-date`);
      const endRangeEl = this.calendar.el.querySelector(`.is-endrange .pika-day`);
      if (toDate) {
        expect(selectedToDate).to.equal(`${toDate.year()}-${padStart(toDate.month() + 1, 2, 0)}-${padStart(toDate.date(), 2, 0)}`);
        this.verifyDayEl(endRangeEl, toDate);
      } else {
        expect(selectedToDate).to.equal(null);
        expect(endRangeEl).to.equal(null);
      }

      const inRangeEls = this.calendar.el.querySelectorAll(`.is-inrange .pika-day`);
      if (fromDate && toDate) {
        const dayDiff = toDate.diff(fromDate, `days`);
        if (dayDiff <= 1) {
          expect(inRangeEls.length).to.equal(0);
        } else {
          expect(inRangeEls.length).to.equal(toDate.diff(fromDate, `days`) - 1);
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
        this.navigateCalendar(moment(`2017-01`));
        const disabledDayEls = this.calendar.el.querySelectorAll(`td.is-disabled:not(.has-event) .pika-day`);
        this.verifyDayEl(disabledDayEls[disabledDayEls.length - 1], moment(`2017-01-04`));
        done();
      });
    });

    it(`setting max-date`, function(done) {
      this.resetCalendar({'max-date': `2017-01-25`}, () => {
        this.navigateCalendar(moment(`2017-01`));
        const disabledDayEls = this.calendar.el.querySelectorAll(`td.is-disabled.has-event .pika-day`);
        this.verifyDayEl(disabledDayEls[0], moment(`2017-01-26`));
        done();
      });
    });

    it(`setting is-double-calendar`, function(done) {
      const pikaTableEls = this.calendar.el.querySelectorAll(`.pika-table`);
      expect(pikaTableEls.length).to.equal(1);
      this.resetCalendar({'is-double-calendar': true}, () => {
        const pikaTableEls = this.calendar.el.querySelectorAll(`.pika-table`);
        expect(pikaTableEls.length).to.equal(2);
        done();
      });
    });
  });

  describe(`updating attributes`, function() {
    it(`updating selected-date`, function() {
      this.calendar.setAttribute(`selected-date`, `2017-01-15`);
      this.navigateCalendar(moment(`2017-01`));
      this.verifySelectedDate(moment(`2017-01-15`));
    });

    it(`updating selected-from-date`, function(done) {
      this.resetCalendar({'is-range': true}, () => {
        this.calendar.setAttribute(`selected-from-date`, `2017-01-15`);
        this.navigateCalendar(moment(`2017-01`));
        this.verifySelectedRange(moment(`2017-01-15`), null);
        done();
      });
    });

    it(`updating selected-from-date and selected-to-date`, function(done) {
      this.resetCalendar({'is-range': true}, () => {
        this.calendar.setAttribute(`selected-from-date`, `2017-01-15`);
        this.calendar.setAttribute(`selected-to-date`, `2017-01-20`);
        this.navigateCalendar(moment(`2017-01`));
        this.verifySelectedRange(moment(`2017-01-15`), moment(`2017-01-20`));
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
        this.clickCalendarDate(moment(`2017-01-15`));
      });

      it(`is correct`, function() {
        this.verifySelectedDate(moment(`2017-01-15`));
      });

      it(`updates selected-date when date is selected`, function() {
        this.verifySelectedDate(moment(`2017-01-15`));
        this.clickCalendarDate(moment(`2017-01-16`));
        this.verifySelectedDate(moment(`2017-01-16`));
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
        this.clickCalendarDate(moment(`2017-01-15`));
      });

      it(`is correct`, function() {
        this.verifySelectedRange(moment(`2017-01-15`), null);
      });

      it(`swaps dates when choosing date that is before selected-from-date`, function() {
        this.verifySelectedRange(moment(`2017-01-15`), null);
        this.clickCalendarDate(moment(`2017-01-10`));
        this.verifySelectedRange(moment(`2017-01-10`), moment(`2017-01-15`));
      });
    });

    describe(`selected-from-date and selected-to-date are set`, function() {
      beforeEach(function() {
        this.clickCalendarDate(moment(`2017-01-15`));
        this.clickCalendarDate(moment(`2017-01-20`));
      });

      it(`clears previous selected-from-date and selected-to-date when new date is selected`, function() {
        this.verifySelectedRange(moment(`2017-01-15`), moment(`2017-01-20`));
        this.clickCalendarDate(moment(`2017-01-16`));
        this.verifySelectedRange(moment(`2017-01-16`), null);
      });
    });

    describe(`is-double-calendar is set`, function() {
      beforeEach(function(done) {
        this.resetCalendar({
          'is-range': true,
          'is-double-calendar': true,
        }, done);
      });

      it(`is correct when date range spans two months`, function() {
        this.clickCalendarDate(moment(`2017-01-16`));
        this.clickCalendarDate(moment(`2017-02-10`));
        this.navigateCalendar(moment(`2017-01`));
        this.verifySelectedRange(moment(`2017-01-16`), moment(`2017-02-10`));
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
        this.verifySelectedRange(moment(`2017-01-10`), moment(`2017-01-15`));
        this.clickCalendarDate(moment(`2017-01-09`));
        this.verifySelectedRange(moment(`2017-01-09`), moment(`2017-01-15`));
      });

      it(`selecting new date that is after selected-to-date sets selected-from-date and selected-to-date`, function() {
        this.verifySelectedRange(moment(`2017-01-10`), moment(`2017-01-15`));
        this.clickCalendarDate(moment(`2017-01-16`));
        this.verifySelectedRange(moment(`2017-01-16`), moment(`2017-01-16`));
      });
    });

    describe(`is-to-date-focused is set`, function() {
      beforeEach(function() {
        this.calendar.setAttribute(`is-to-date-focused`, true);
      });

      it(`selecting new date sets selected-to-date`, function() {
        this.verifySelectedRange(moment(`2017-01-10`), moment(`2017-01-15`));
        this.clickCalendarDate(moment(`2017-01-16`));
        this.verifySelectedRange(moment(`2017-01-10`), moment(`2017-01-16`));
      });

      it(`selecting new date that is before selected-from-date sets selected-from-date and selected-to-date`, function() {
        this.verifySelectedRange(moment(`2017-01-10`), moment(`2017-01-15`));
        this.clickCalendarDate(moment(`2017-01-09`));
        this.verifySelectedRange(moment(`2017-01-09`), moment(`2017-01-09`));
      });
    });
  });
});
