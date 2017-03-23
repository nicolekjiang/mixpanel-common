import { Component } from 'panel';
import Pikaday from 'pikaday';

import { formatDate, normalizeDateRange, parseDate } from '../../util/date';
import { registerMPElement } from  '../../util/register-element.js';

import template from './index.jade';
import css from './index.styl';

const INCOMPLETE_RANGE_CLASS = `incomplete-range`;

export default registerMPElement(`mp-calendar`, class extends Component {
  get config() {
    return {
      css,
      template,
      useShadowDom: true,
      // updateSync is needed since we attach the pikaday calendar to this component in the attachedCallback, so
      // we need the DOM updated synchronously in the attachedCallback.
      updateSync: true,
    };
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    this.init();
  }

  attributeChangedCallback(name) {
    super.attributeChangedCallback(...arguments);

    if (!this.initialized || this.ignoreAttributeChanges) {
      return;
    }

    if ([`selected-date`, `selected-from-date`, `selected-to-date`].includes(name)) {
      this.updatePicker();
    }
  }

  get isDoubleCalendar() {
    return this.isAttributeEnabled(`is-double-calendar`);
  }

  get isRange() {
    return this.isAttributeEnabled(`is-range`);
  }

  getDateAttribute(name) {
    if (this.hasAttribute(name)) {
      const date = this.getAttribute(name);
      if (this.parseDate(date)) {
        return date;
      } else {
        throw new Error(`${name} is set to invalid value ${date}`);
      }
    } else {
      return null;
    }
  }

  setDateAttribute(name, date) {
    if (date) {
      this.setAttribute(name, date);
    } else {
      this.removeAttribute(name);
    }
  }

  get minDate() {
    return this.getDateAttribute(`min-date`) || null;
  }

  get maxDate() {
    if (this.hasAttribute(`max-date`)) {
      return this.getDateAttribute(`max-date`);
    } else {
      return this.formatDate(new Date());
    }
  }

  get selectedDate() {
    return this.getDateAttribute(`selected-date`);
  }

  set selectedDate(date) {
    this.setDateAttribute(`selected-date`, date);
  }

  get selectedFromDate() {
    return this.getDateAttribute(`selected-from-date`);
  }

  set selectedFromDate(date) {
    this.setDateAttribute(`selected-from-date`, date);
  }

  get selectedToDate() {
    return this.getDateAttribute(`selected-to-date`);
  }

  set selectedToDate(date) {
    this.setDateAttribute(`selected-to-date`, date);
  }

  get isFromDateFocused() {
    return this.isAttributeEnabled(`is-from-date-focused`);
  }

  get isToDateFocused() {
    return this.isAttributeEnabled(`is-to-date-focused`);
  }

  init() {
    this.contentEl = this.el.querySelector(`.calendar`);
    this.contentEl.innerHTML = ``;

    this.picker = new Pikaday({
      bound: false,
      // HACK: Set events to disabled days in the future gives these days a specific class to indicate they are
      // events. Doing this allows targeting disabled days in the past and future separately to give them different
      // styles.
      events: this.getFutureDateObjs(),
      mainCalendar: `right`,
      maxDate: this.maxDate ? this.parseDate(this.maxDate) : null,
      minDate: this.minDate ? this.parseDate(this.minDate) : null,
      numberOfMonths: this.isDoubleCalendar ? 2 : 1,
      i18n: {
        previousMonth: `Previous Month`,
        nextMonth: `Next Month`,
        months: [
          `January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`,
          `October`, `November`, `December`,
        ],
        weekdays: [`Sunday`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`],
        weekdaysShort: [`SU`, `MO`, `TU`, `WE`, `TH`, `FR`, `SA`],
      },
      showDaysInNextAndPreviousMonths: false,
      theme: `pika-mixpanel`,
      yearRange: 10,
      onSelect: date => this.handleSelectDate(date),
      onDraw: () => this.handleDraw(),
    });

    // Pikaday registers a keydown event handler on the document (?#&!), get rid of it
    document.removeEventListener(`keydown`, this.picker._onKeyChange);

    this.contentEl.appendChild(this.picker.el);

    if (!this.isRange) {
      if (this.selectedDate) {
        this.picker.gotoDate(this.parseDate(this.selectedDate));
      }
    } else {
      if (this.selectedToDate) {
        this.picker.gotoDate(this.parseDate(this.selectedToDate));
      } else if (this.selectedFromDate) {
        this.picker.gotoDate(this.parseDate(this.selectedFromDate));
      }
    }
    this.updatePicker();
  }

  getFutureDateObjs() {
    if (!this.maxDate) {
      return [];
    }

    let futureDates = [];
    const maxDate = this.parseDate(this.maxDate);
    let date = maxDate.getDate();
    const thisMonth = maxDate.getMonth();
    const thisYear = maxDate.getFullYear();
    let newDate = new Date(thisYear, thisMonth, date);
    while (newDate.getMonth() === thisMonth) {
      futureDates.push(newDate.toDateString());
      date++;
      newDate = new Date(thisYear, thisMonth, date);
    }
    return futureDates;
  }

  updatePicker() {
    if (!this.picker) {
      return;
    }

    if (!this.isRange) {
      if (this.selectedDate) {
        this.picker.setDate(this.parseDate(this.selectedDate), /* preventOnSelect= */true);
      }
    } else {
      if (this.selectedFromDate) {
        this.picker.setStartRange(this.parseDate(this.selectedFromDate));
      }
      if (this.selectedToDate) {
        this.picker.setEndRange(this.parseDate(this.selectedToDate));
      }
    }

    if (!this.selectedFromDate ^ !this.selectedToDate) {
      this.picker.el.classList.add(INCOMPLETE_RANGE_CLASS);
    } else {
      this.picker.el.classList.remove(INCOMPLETE_RANGE_CLASS);
    }

    this.picker.draw();
  }

  formatDate(dateObj) {
    const date = formatDate(dateObj, {iso: true});
    if (!date) {
      throw new Error(`Could not formatDate(${dateObj})`);
    }
    return date;
  }

  parseDate(date) {
    const dateObj = parseDate(date);
    if (!dateObj) {
      throw new Error(`Could not parseDate(${date})`);
    }
    return dateObj;
  }

  handleSelectDate(dateObj) {
    this.ignoreAttributeChanges = true;

    const date = this.formatDate(dateObj);
    const oldDate = this.selectedDate;
    const oldFrom = this.selectedFromDate;
    const oldTo = this.selectedToDate;

    if (!this.isRange) {
      this.selectedDate = date;
    } else {
      if (this.isFromDateFocused || this.isToDateFocused) {
        if (this.isFromDateFocused) {
          this.selectedFromDate = date;
          [this.selectedFromDate, this.selectedToDate] = normalizeDateRange(
            this.selectedFromDate,
            this.selectedToDate,
            `from`
          );
        } else {
          this.selectedToDate = date;
          [this.selectedFromDate, this.selectedToDate] = normalizeDateRange(
            this.selectedFromDate,
            this.selectedToDate,
            `to`
          );
        }
      } else {
        if (!this.selectedFromDate) {
          this.selectedFromDate = date;
        } else if (!this.selectedToDate) {
          this.selectedToDate = date;
        } else {
          this.selectedFromDate = date;
          this.selectedToDate = null;
        }

        if (this.selectedFromDate && this.selectedToDate
            && this.parseDate(this.selectedFromDate) > this.parseDate(this.selectedToDate)
        ) {
          [this.selectedFromDate, this.selectedToDate] = [this.selectedToDate, this.selectedFromDate];
        }
      }
    }

    if (this.selectedDate !== oldDate || this.selectedFromDate !== oldFrom || this.selectedToDate !== oldTo) {
      this.updatePicker();
    }

    this.emitSelectDate();

    this.ignoreAttributeChanges = false;
  }

  emitSelectDate() {
    const detail = {};
    if (this.isRange) {
      detail.from = this.selectedFromDate;
      detail.to = this.selectedToDate;
    } else {
      detail.date = this.selectedDate;
    }
    this.dispatchEvent(new CustomEvent(`selectDate`, {detail}));
  }

  handleDraw() {
    if (!this.picker) {
      // Pikaday will trigger this callback in its constructor, before this.picker has been initialized.
      return;
    }

    this.addPickerRowClasses();
    this.dispatchEvent(new CustomEvent(`draw`));
  }

  // For each tr, if it has a child td.is-(start|end|in)range give it the class .has-(start|end|in)range
  // Used to handle edge cases around highlighting cells in the month grid where days are not shown
  // because they are from previous or following months. We still want to highlight these cells
  // according to the date range that is selected.
  addPickerRowClasses() {
    for (const row of Array.from(this.picker.el.getElementsByTagName(`tr`))) {
      for (const type of [`start`, `end`, `in`]) {
        if (Array.from(row.childNodes).some(node => node.classList.contains(`is-${type}range`))) {
          row.classList.add(`has-${type}range`);
        }
      }
    }
  }
});
