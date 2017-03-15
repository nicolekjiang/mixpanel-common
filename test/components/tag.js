/* global beforeEach, describe, it */
import expect from 'expect.js';
import '../../lib/components/tag';

describe(`Test tag component`, () => {
  beforeEach(function(done) {
    document.body.innerHTML = ``;
    this.widget = document.createElement(`mp-tag`);
    this.widget.setAttribute(`removable`, true);
    document.body.appendChild(this.widget);

    window.requestAnimationFrame(() => done());
  });

  it(`fires close event`, function(done) {
    this.widget.addEventListener(`remove`, () => {
      done();
    });
    this.widget.el.querySelector(`.remove-tag`).dispatchEvent(new MouseEvent(`click`));
  });
});
