/* global beforeEach, describe, it */
import expect from 'expect.js';

import {extend} from '../../lib/util/index';
import '../../lib/widgets/items-menu';

describe(`Test mp-items-menu`, function() {
  beforeEach(function() {
    this.createItemsMenuWithItem = (item, cb) => {
      document.body.innerHTML = ``;
      const itemsMenu = document.createElement(`mp-items-menu`);
      itemsMenu.style.width = `300px`;
      document.body.appendChild(itemsMenu);

      const items = !item ? [] : [extend({label: `An event`}, item)];
      itemsMenu.setAttribute(`sections`, JSON.stringify([{items}]));

      window.requestAnimationFrame(() => {
        cb(itemsMenu);
      });
    };
  });

  describe(`"item" properties`, function() {
    it(`hasPropertiesPill`, function(done) {
      this.createItemsMenuWithItem({hasPropertiesPill: true}, itemsMenu => {
        const pillEl = itemsMenu.el.querySelector(`.list-option .pill`);
        expect(pillEl).not.equal(null);

        itemsMenu.addEventListener(`clickPropertiesPill`, () => done());
        pillEl.dispatchEvent(new MouseEvent(`click`, {bubbles: true}));
      });
    });

    it(`isPropertiesPillDisabled`, function(done) {
      this.createItemsMenuWithItem({
        hasPropertiesPill: true,
        isPropertiesPillDisabled: true,
      }, itemsMenu => {
        const pillEl = itemsMenu.el.querySelector(`.list-option .pill.disabled`);
        expect(pillEl).not.equal(null);
        done();
      });
    });

    it(`hasCaret`, function(done) {
      this.createItemsMenuWithItem({hasCaret: true}, itemsMenu => {
        const caretEl = itemsMenu.el.querySelector(`.list-option .caret`);
        expect(caretEl).not.equal(null);
        done();
      });
    });

    it(`label`, function(done) {
      this.createItemsMenuWithItem({label: `Test event`}, itemsMenu => {
        const labelEl = itemsMenu.el.querySelector(`.list-option .label`);
        expect(labelEl.textContent).to.contain(`Test event`);
        done();
      });
    });

    it(`icon`, function(done) {
      this.createItemsMenuWithItem({icon: `event`}, itemsMenu => {
        const iconEl = itemsMenu.el.querySelector(`.list-option svg-icon[icon="event"]`);
        expect(iconEl).not.equal(null);
        done();
      });
    });

    it(`isDisabled`, function(done) {
      this.createItemsMenuWithItem({isDisabled: true}, itemsMenu => {
        const listOptionEl = itemsMenu.el.querySelector(`.list-option.disabled`);
        expect(listOptionEl).not.equal(null);
        done();
      });
    });

    it(`isSelected`, function(done) {
      this.createItemsMenuWithItem({isSelected: `event`}, itemsMenu => {
        const listOptionEl = itemsMenu.el.querySelector(`.list-option.selected:not(.selectable)`);
        expect(listOptionEl).not.equal(null);
        done();
      });
    });

    it(`isSelected and hasCaret`, function(done) {
      this.createItemsMenuWithItem({
        isSelected: true,
        hasCaret: true,
      }, itemsMenu => {
        const listOptionEl = itemsMenu.el.querySelector(`.list-option.selected.selectable`);
        expect(listOptionEl).not.equal(null);
        done();
      });
    });
  });

  describe(`search-filter`, function() {
    it(`matches item`, function(done) {
      this.createItemsMenuWithItem({label: `An event`}, itemsMenu => {
        itemsMenu.setAttribute(`search-filter`, `eve`);
        window.requestAnimationFrame(() => {
          const listOptionEl = itemsMenu.el.querySelector(`.list-option`);
          expect(listOptionEl).not.equal(null);

          const matchEls = listOptionEl.querySelectorAll(`.substr`);
          expect(matchEls.length).to.equal(4);
          expect(matchEls[0].textContent).to.contain(``);
          expect(matchEls[1].textContent).to.contain(`An `);
          expect(matchEls[2].textContent).to.contain(`eve`);
          expect(matchEls[3].textContent).to.contain(`nt`);

          done();
        });
      });
    });

    it(`doesn't match item`, function(done) {
      this.createItemsMenuWithItem({label: `An event`}, itemsMenu => {
        itemsMenu.setAttribute(`search-filter`, `bad`);
        window.requestAnimationFrame(() => {
          const listOptionEls = itemsMenu.el.querySelectorAll(`.list-option`);
          expect(listOptionEls.length).to.equal(1);
          expect(listOptionEls[0].textContent).to.contain(`Your search returned no results`);
          done();
        });
      });
    });
  });

  describe(`empty-message`, function() {
    it(`is correct`, function(done) {
      this.createItemsMenuWithItem(null, itemsMenu => {
        itemsMenu.setAttribute(`empty-message`, `No items`);
        window.requestAnimationFrame(() => {
          const listOptionEls = itemsMenu.el.querySelectorAll(`.list-option`);
          expect(listOptionEls.length).to.equal(1);
          expect(listOptionEls[0].textContent).to.contain(`No items`);
          done();
        });
      });
    });
  });
});
