/* eslint-env jasmine, mocha */
import expect from 'expect.js';

import '../../lib/components/drop-menu';

const VISIBILITY_OPEN = `open`;
const VISIBILITY_OPENING = `opening`;
const VISIBILITY_CLOSED = `closed`;
const VISIBILITY_CLOSING = `closing`;

describe(`Test mixpanel-common menu component`, function() {
  beforeEach(function(done) {
    document.body.innerHTML = ``;
    this.menu = document.createElement(`mp-drop-menu`);
    document.body.appendChild(this.menu);
    window.requestAnimationFrame(() => done());
  });

  describe(`"open" attribute`, function() {
    it(`is closed by default`, function() {
      expect(this.menu.state.visibility).to.equal(VISIBILITY_CLOSED);
    });

    it(`opens when set to "true" before it is attached`, function() {
      document.body.removeChild(this.menu);
      this.menu.setAttribute(`open`, `true`);
      document.body.appendChild(this.menu);
      expect(this.menu.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it(`opens when set to "true"`, function() {
      this.menu.setAttribute(`open`, `true`);
      expect(this.menu.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it(`closes when set to "false"`, function() {
      this.menu.setAttribute(`open`, `true`);
      this.menu.update({visibility: VISIBILITY_OPEN});
      this.menu.setAttribute(`open`, `false`);
      expect(this.menu.state.visibility).to.equal(VISIBILITY_CLOSING);
    });
  });
});
