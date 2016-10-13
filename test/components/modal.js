/* global beforeEach, describe, it */
import expect from 'expect.js';
import 'webcomponents.js/webcomponents';

import '../../lib/components/modals/modal'
import { onAnimationEnd, offAnimationEnd } from '../../lib/components/utils';

const VISIBILITY_OPEN = 'open';
const VISIBILITY_OPENING = 'opening';
const VISIBILITY_CLOSED = 'closed';
const VISIBILITY_CLOSING = 'closing';

describe('Test mixpanel-common modal component', function() {
  beforeEach(function(done) {
    document.body.innerHTML = '';
    this.modal = document.createElement('mp-modal');
    document.body.appendChild(this.modal);
    window.requestAnimationFrame(() => done());
  });

  describe('imperative API', function() {
    it('opens when "open()" is called', function() {
      this.modal.open();
      expect(this.modal.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it('closes when "close()" is called', function() {
      this.modal.update({visibility: VISIBILITY_OPEN});
      this.modal.close();
      expect(this.modal.state.visibility).to.equal(VISIBILITY_CLOSING);
    });

    it('opens when "open()" is called before close animation completes', function() {
      this.modal.update({visibility: VISIBILITY_OPEN});
      this.modal.close();
      expect(this.modal.state.visibility).to.equal(VISIBILITY_CLOSING);
      this.modal.open();
      expect(this.modal.state.visibility).to.equal(VISIBILITY_OPEN);
    });

    it('closes when "close()" is called before open animation completes', function() {
      this.modal.open();
      expect(this.modal.state.visibility).to.equal(VISIBILITY_OPENING);
      this.modal.close();
      expect(this.modal.state.visibility).to.equal(VISIBILITY_CLOSED);
    });
  });

  describe('"closed" attribute', function() {
   it('immediately opens when set to "false" before it is attached', function() {
      document.body.removeChild(this.modal);
      this.modal.setAttribute('closed', 'false');
      document.body.appendChild(this.modal);
      expect(this.modal.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it('opens when set to "false"', function() {
      this.modal.setAttribute('closed', 'false');
      expect(this.modal.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it('closes when set to "true"', function() {
      this.modal.setAttribute('closed', 'false');
      this.modal.update({visibility: VISIBILITY_OPEN});
      this.modal.setAttribute('closed', 'true');
      expect(this.modal.state.visibility).to.equal(VISIBILITY_CLOSING);
    });
  });

  describe('"closeable" attribute', function() {
    it('does not close when clicked outside when not enabled', function(done) {
      this.modal.setAttribute('closeable', 'false');
      this.modal.update({visibility: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        this.modal.shadowRoot.querySelector('.mp-modal-backdrop').dispatchEvent(new MouseEvent('click'));
        expect(this.modal.state.visibility).to.equal(VISIBILITY_OPEN);
        done();
      });
    });

    it('closes when clicked outside when enabled', function(done) {
      this.modal.setAttribute('closeable', 'true');
      this.modal.update({visibility: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        this.modal.shadowRoot.querySelector('.mp-modal-backdrop').dispatchEvent(new MouseEvent('click'));
        expect(this.modal.state.visibility).to.equal(VISIBILITY_CLOSING);
        done();
      });
    });

    it('does not have a close button when not enabled', function(done) {
      this.modal.setAttribute('closeable', 'false');
      this.modal.update({visibility: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        expect(this.modal.shadowRoot.querySelector('mp-modal-close-btn')).to.equal(null);
        done();
      });
    });

    it('has a close button when enabled', function(done) {
      this.modal.setAttribute('closeable', 'true');
      this.modal.update({visibility: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        expect(this.modal.shadowRoot.querySelector('.mp-modal-close-btn')).to.not.equal(null);
        done();
      });
    });
  });

  describe('"modal-type" attribute', function() {
    it('does take over the screen if the "modal-type" is modal', function(done) {
      this.modal.setAttribute('modal-type', 'modal');
      this.modal.update({visibility: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        expect(this.modal.shadowRoot.querySelector('.mp-modal-backdrop')).to.not.equal(null);
        done();
      });
    });

    it('does not take over the screen if the "modal-type" is popup', function(done) {
      this.modal.setAttribute('modal-type', 'popup');
      this.modal.update({visibility: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        expect(this.modal.shadowRoot.querySelector('.mp-modal-backdrop')).to.equal(null);
        done();
      });
    });
  });

  describe('life-cycle', function() {

    it('animates open', function(done) {
      const animations = ['fadeModalIn', 'fadeOverlayIn'];
      const animationEnd = e => {
        const idx = animations.indexOf(e.animationName)
        if (idx === -1) {
          throw Error(`Unexpected animation '${e.animationName}'`);
        }
        animations.splice(idx, 1);
        if (animations.length === 0) {
          offAnimationEnd(this.modal, animationEnd);
          done();
        }
      };
      onAnimationEnd(this.modal, animationEnd);
      this.modal.open();
    });

    it('animates closed', function(done) {
      this.modal.update({visibility: VISIBILITY_OPEN});
      const animations = ['fadeModalOut', 'fadeOverlayOut'];
      const animationEnd = e => {
        const idx = animations.indexOf(e.animationName)
        if (idx === -1) {
          throw Error(`Unexpected animation '${e.animationName}'`);
        }
        animations.splice(idx, 1);
        if (animations.length === 0) {
          offAnimationEnd(this.modal, animationEnd);
          done();
        }
      };
      onAnimationEnd(this.modal, animationEnd);
      this.modal.close();
    });

    it('fires "change" event when open is complete', function(done) {
      this.modal.addEventListener('change', e => {
        if (e.detail.state === VISIBILITY_OPEN) {
          done();
        }
      });
      this.modal.open();
    });

    it('fires "change" event when close is complete', function(done) {
      this.modal.update({visibility: VISIBILITY_OPEN});
      this.modal.addEventListener('change', e => {
        if (e.detail.state === VISIBILITY_CLOSED) {
          done();
        }
      });
      this.modal.close();
    });
  });

  describe('full integration', function() {
    it('attaches in a closed state', function() {
      expect(this.modal.state.visibility).to.equal(VISIBILITY_CLOSED);
    });

    it('is visible after "open()" is called', function(done) {
      this.modal.addEventListener('change', e => {
        if (e.detail.state === VISIBILITY_OPEN) {
          window.requestAnimationFrame(() => {
            const modalRoot = this.modal.shadowRoot.querySelector('.mp-modal-stage');
            expect(modalRoot.classList.contains('mp-modal-closed')).to.equal(false);
            expect(window.getComputedStyle(modalRoot).display).to.equal('block');
            done();
          });
        }
      });
      this.modal.open();
    });

    it('is invisible after "close()" is called', function(done) {
      this.modal.update({visibility: VISIBILITY_OPEN});
      this.modal.addEventListener('change', e => {
        if (e.detail.state === VISIBILITY_CLOSED) {
          window.requestAnimationFrame(() => {
            const modalRoot = this.modal.shadowRoot.querySelector('.mp-modal-stage');
            expect(modalRoot.classList.contains('mp-modal-closed')).to.equal(true);
            expect(window.getComputedStyle(modalRoot).display).to.equal('none');
            done();
          });
        }
      });
      this.modal.close();
    });
  });
});
