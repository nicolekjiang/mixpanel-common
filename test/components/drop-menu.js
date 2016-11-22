/* global beforeEach, describe, it */
import expect from 'expect.js';
import 'webcomponents.js/webcomponents';

import '../../lib/components/drop-menu';
import { onAnimationEnd, offAnimationEnd } from '../../lib/components/utils';

const VISIBILITY_OPEN = 'open';
const VISIBILITY_OPENING = 'opening';
const VISIBILITY_CLOSED = 'closed';
const VISIBILITY_CLOSING = 'closing';

describe('Test mixpanel-common menu component', function() {
  beforeEach(function(done) {
    document.body.innerHTML = '';
    this.menu = document.createElement('mp-menu');
    document.body.appendChild(this.menu);
    window.requestAnimationFrame(() => done());
  });

  describe('imperative API', function() {
    it('opens when "open()" is called', function() {
      this.menu.open();
      expect(this.menu.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it('closes when "close()" is called', function() {
      this.menu.update({visibility: VISIBILITY_OPEN});
      this.menu.close();
      expect(this.menu.state.visibility).to.equal(VISIBILITY_CLOSING);
    });

    it('opens when "open()" is called before close animation completes', function() {
      this.menu.update({visibility: VISIBILITY_OPEN});
      this.menu.close();
      expect(this.menu.state.visibility).to.equal(VISIBILITY_CLOSING);
      this.menu.open();
      expect(this.menu.state.visibility).to.equal(VISIBILITY_OPEN);
    });

    it('closes when "close()" is called before open animation completes', function() {
      this.menu.open();
      expect(this.menu.state.visibility).to.equal(VISIBILITY_OPENING);
      this.menu.close();
      expect(this.menu.state.visibility).to.equal(VISIBILITY_CLOSED);
    });
  });

  describe('"open" attribute', function() {
   it('does not open when set to "false" before it is attached', function() {
      document.body.removeChild(this.menu);
      this.menu.setAttribute('open', 'false');
      document.body.appendChild(this.menu);
      expect(this.menu.state.visibility).to.equal(VISIBILITY_CLOSED);
    });

    it('opens when set to "true"', function() {
      this.menu.setAttribute('open', 'true');
      expect(this.menu.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it('closes when set to "false"', function() {
      this.menu.setAttribute('open', 'true');
      this.menu.update({visibility: VISIBILITY_OPEN});
      this.menu.setAttribute('open', 'false');
      expect(this.menu.state.visibility).to.equal(VISIBILITY_CLOSING);
    });
  });
}
