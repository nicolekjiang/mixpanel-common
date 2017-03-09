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
      return parseDate(this.getAttribute(name));
    } else {
      return null;
    }
  }

  setDateAttribute(name, date) {
    if (date) {
      this.setAttribute(name, formatDate(date, {iso: true}));
    } else {
      this.removeAttribute(name);
    }
  }

  get minDate() {
    return this.getDateAttribute(`min-date`) || null;
  }

  get maxDate() {
    return this.getDateAttribute(`max-date`) || new Date();
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
      events: this.getFutureDates(),
      mainCalendar: `right`,
      maxDate: this.maxDate,
      minDate: this.minDate,
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
      this.picker.gotoDate(this.selectedDate);
    } else {
      this.picker.gotoDate(this.selectedToDate || this.selectedFromDate);
    }
    this.updatePicker();
  }

  getFutureDates() {
    let futureDates = [];
    const maxDate = this.maxDate;
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
      this.picker.setDate(this.selectedDate, /* preventOnSelect= */true);
    } else {
      this.picker.setStartRange(this.selectedFromDate);
      this.picker.setEndRange(this.selectedToDate);
    }

    if (this.selectedFromDate && !this.selectedToDate) {
      this.picker.el.classList.add(INCOMPLETE_RANGE_CLASS);
    } else {
      this.picker.el.classList.remove(INCOMPLETE_RANGE_CLASS);
    }

    this.picker.draw();
  }

  handleSelectDate(date) {
    this.ignoreAttributeChanges = true;

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
            [this.selectedFromDate, this.selectedToDate], `from`
          );
        } else {
          this.selectedToDate = date;
          [this.selectedFromDate, this.selectedToDate] = normalizeDateRange(
            [this.selectedFromDate, this.selectedToDate], `to`
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

        if (this.selectedFromDate && this.selectedToDate && this.selectedFromDate > this.selectedToDate) {
          [this.selectedFromDate, this.selectedToDate] = [this.selectedToDate, this.selectedFromDate];
        }
      }
    }

    if (formatDate(this.selectedDate, {iso: true}) !== formatDate(oldDate, {iso: true})
      || formatDate(this.selectedFromDate, {iso: true}) !== formatDate(oldFrom, {iso: true})
      || formatDate(this.selectedToDate, {iso: true}) !== formatDate(oldTo, {iso: true})
    ) {
      this.updatePicker();
    }

    this.emitSelectDate();

    this.ignoreAttributeChanges = false;
  }

  emitSelectDate() {
    const detail = {};
    if (this.isRange) {
      detail.from = formatDate(this.selectedFromDate, {iso: true});
      detail.to = formatDate(this.selectedToDate, {iso: true});
    } else {
      detail.date = formatDate(this.selectedDate, {iso: true});
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
