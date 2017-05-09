/* global beforeEach, afterEach, describe, it */

/**
 * Put tests that require browser globals (e.g window.*) in this file.
 * They will run as part of sauce tests but not as unit tests.
 */

import expect from 'expect.js';
import {clickWasOutside} from '../../lib/util/dom';
import {truncateToElement, truncateToWidth} from '../../lib/util';

if (typeof window !== `undefined`) {
  describe(`clickWasOutside`, function() {
    beforeEach(function(done) {
      document.body.innerHTML = `<div id="parent"><span id="child"></span></div>`;
      this.parentElement = document.createElement(`div`);
      document.body.appendChild(this.parentElement);
      const shadowRoot = this.parentElement.createShadowRoot();

      this.childElementA = document.createElement(`div`);
      this.childElementB = document.createElement(`div`);
      shadowRoot.appendChild(this.childElementA);
      shadowRoot.appendChild(this.childElementB);
      const childShadowRootA = this.childElementA.createShadowRoot();
      this.childElementB.createShadowRoot();

      this.childElementC = document.createElement(`div`);
      childShadowRootA.appendChild(this.childElementC);
      this.childElementC.createShadowRoot();

      // let the webcomponent.js polyfill upgrade the elements
      requestAnimationFrame(() => done());
    });

    afterEach(function() {
      document.removeEventListener(`click`, this.clickOutsideListener);
    });

    it(`identifies when an element within another element is clicked`, function(done) {
      const parentElement = document.getElementById(`parent`);
      const childElement = document.getElementById(`child`);
      this.clickOutsideListener = e => {
        expect(clickWasOutside(e, parentElement)).to.equal(false);
        done();
      };

      document.addEventListener(`click`, this.clickOutsideListener);
      childElement.click();
    });

    it(`identifies when an element outside another element is clicked`, function(done) {
      const parentElement = document.getElementById(`parent`);
      const childElement = document.getElementById(`child`);
      this.clickOutsideListener = e => {
        expect(clickWasOutside(e, childElement)).to.equal(true);
        done();
      };

      document.addEventListener(`click`, this.clickOutsideListener);
      parentElement.click();
    });

    it(`identifies that a parent element is outside a child shadow DOM`, function(done) {
      this.clickOutsideListener = e => {
        expect(clickWasOutside(e, this.parentElement)).to.equal(false);
        expect(clickWasOutside(e, this.childElementA)).to.equal(true);
        done();
      };

      document.addEventListener(`click`, this.clickOutsideListener);
      this.parentElement.click();
    });

    it(`identifies that a child shadow DOM element is inside its parent and outside its sibling`, function(done) {
      this.clickOutsideListener = e => {
        expect(clickWasOutside(e, this.parentElement)).to.equal(false);
        expect(clickWasOutside(e, this.childElementB)).to.equal(true);
        done();
      };

      document.addEventListener(`click`, this.clickOutsideListener);
      this.childElementA.click();
    });

    it(`identifies that a nested child shadow DOM element is inside its parents but outside their siblings`, function(done) {
      this.clickOutsideListener = e => {
        expect(clickWasOutside(e, this.parentElement)).to.equal(false);
        expect(clickWasOutside(e, this.childElementA)).to.equal(false);
        expect(clickWasOutside(e, this.childElementB)).to.equal(true);
        done();
      };

      document.addEventListener(`click`, this.clickOutsideListener);
      this.childElementC.click();
    });
  });

  describe(`truncateToWidth`, function() {
    it(`finds the largest truncation which fits in the given space and font`, function() {
      expect(truncateToWidth(`abcdefghijklmnopqrstuvwxyz`, `12px Arial`, 35)).to.eql(`ab...z`);
      expect(truncateToWidth(`abcdefghijklmnopqrstuvwxyz`, `12px Arial`, 25)).to.eql(`a...z`);
      expect(truncateToWidth(`abcdefghijklmnopqrstuvwxyz`, `22px Arial`, 35)).to.eql(`ab`);
    });
  });

  describe(`truncateToElement`, function() {
    it(`finds the largest truncation which fits in the given element, taking account of font / padding`, function() {
      var elem = document.createElement(`div`);
      document.body.appendChild(elem);
      elem.style.width = `35px`;
      elem.style.font = `12px Arial`;
      elem.style.padding = `0px`;
      expect(truncateToElement(`abcdefghijklmnopqrstuvwxyz`, elem)).to.eql(`ab...z`);
      elem.style.padding = `10px`;
      expect(truncateToElement(`abcdefghijklmnopqrstuvwxyz`, elem)).to.eql(`ab...z`);
      document.body.removeChild(elem);
    });
  });
}
