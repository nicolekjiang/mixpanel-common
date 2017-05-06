/* eslint-env jasmine, mocha */
import expect from 'expect.js';

import '../../lib/components/switch';

describe(`Test mp-switch`, function() {
  beforeEach(function(done) {
    document.body.innerHTML = ``;
    this.switch = document.createElement(`mp-switch`);
    document.body.appendChild(this.switch);
    window.requestAnimationFrame(() => done());
  });

  describe(`"on" attribute`, function() {
    it(`is off by default`, function() {
      expect(this.switch.state.on).to.equal(false);
    });

    it(`is on when set to "true" before it is attached`, function() {
      document.body.removeChild(this.switch);
      this.switch.setAttribute(`on`, true);
      document.body.appendChild(this.switch);
      expect(this.switch.state.on).to.equal(true);
    });

    it(`toggles when clicked`, function() {
      const switchEl = this.switch.el.querySelector(`.mp-switch`);
      switchEl.click();
      expect(this.switch.state.on).to.equal(true);
      switchEl.click();
      expect(this.switch.state.on).to.equal(false);
    });
  });

  describe(`"disabled" attribute`, function() {
    it(`is off by default`, function() {
      expect(this.switch.state.disabled).to.equal(false);
    });

    it(`disables click action when true`, function() {
      this.switch.update({disabled: true});
      const switchEl = this.switch.el.querySelector(`.mp-switch`);
      switchEl.click();
      expect(this.switch.state.on).to.equal(false);
    });
  });
});
