/* global beforeEach, afterEach, describe, it */

import expect from 'expect.js';
import { clickWasOutside } from '../../lib/util/dom';

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
