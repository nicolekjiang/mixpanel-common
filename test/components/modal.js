/* global beforeEach, describe, it */
import expect from 'expect.js';

import '../../lib/components/modals/modal'
import { onAnimationEnd, offAnimationEnd } from '../../lib/components/utils';

const STATE_OPEN = 'open';
const STATE_OPENING = 'opening';
const STATE_CLOSED = 'closed';
const STATE_CLOSING = 'closing';

describe('Test mixpanel-common modal component', () => {
  let modal;
  beforeEach(() => {
    modal = document.createElement('mp-modal');
    document.body.appendChild(modal);
  });

  afterEach(() => {
    document.body.removeChild(modal);
  });

  describe('test imperative API', () => {
    it('opens when "open()" is called', () => {
      modal.open();
      expect(modal.state.state).to.equal(STATE_OPENING);
    });

    it('closes when "close()" is called', () => {
      modal.update({state: STATE_OPEN});
      modal.close();
      expect(modal.state.state).to.equal(STATE_CLOSING);
    });

    it('opens when "open()" is called before close animation completes', () => {
      modal.update({state: STATE_OPEN});
      modal.close();
      expect(modal.state.state).to.equal(STATE_CLOSING);
      modal.open();
      expect(modal.state.state).to.equal(STATE_OPEN);
    });

    it('closes when "close()" is called before open animation completes', () => {
      modal.open();
      expect(modal.state.state).to.equal(STATE_OPENING);
      modal.close();
      expect(modal.state.state).to.equal(STATE_CLOSED);
    });
  });

  describe('test "closed" attribute', () => {
   it('immediately opens when set to "false" before it is attached', () => {
      document.body.removeChild(modal);
      modal.setAttribute('closed', 'false');
      document.body.appendChild(modal);
      expect(modal.state.state).to.equal(STATE_OPENING);
    });

    it('opens when set to "false"', () => {
      modal.setAttribute('closed', 'false');
      expect(modal.state.state).to.equal(STATE_OPENING);
    });

    it('closes when set to "true"', () => {
      modal.setAttribute('closed', 'false');
      modal.update({state: STATE_OPEN});
      modal.setAttribute('closed', 'true');
      expect(modal.state.state).to.equal(STATE_CLOSING);
    });
  });

  describe('test "closeable" attribute', () => {
    it('does not close when clicked outside when not enabled', done => {
      modal.setAttribute('closeable', 'false');
      modal.update({state: STATE_OPEN});
      window.requestAnimationFrame(() => {
        modal.shadowRoot.querySelector('.mp-modal-backdrop').dispatchEvent(new MouseEvent('click'));
        expect(modal.state.state).to.equal(STATE_OPEN);
        done();
      });
    });

    it('closes when clicked outside when enabled', done => {
      modal.setAttribute('closeable', 'true');
      modal.update({state: STATE_OPEN});
      window.requestAnimationFrame(() => {
        modal.shadowRoot.querySelector('.mp-modal-backdrop').dispatchEvent(new MouseEvent('click'));
        expect(modal.state.state).to.equal(STATE_CLOSING);
        done();
      });
    });

    it('does not have a close button when not enabled', done => {
      modal.setAttribute('closeable', 'false');
      modal.update({state: STATE_OPEN});
      window.requestAnimationFrame(() => {
        expect(modal.shadowRoot.querySelector('mp-modal-close-btn')).to.equal(null);
        done();
      });
    });

    it('has a close button when enabled', done => {
      modal.setAttribute('closeable', 'true');
      modal.update({state: STATE_OPEN});
      window.requestAnimationFrame(() => {
        expect(modal.shadowRoot.querySelector('.mp-modal-close-btn')).to.not.equal(null);
        done();
      });
    });
  });

  describe('test "modal-type" attribute', () => {
    it('does take over the screen if the "modal-type" is modal', done => {
      modal.setAttribute('modal-type', 'modal');
      modal.update({state: STATE_OPEN});
      window.requestAnimationFrame(() => {
        expect(modal.shadowRoot.querySelector('.mp-modal-backdrop')).to.not.equal(null);
        done();
      });
    });

    it('does not take over the screen if the "modal-type" is popup', done => {
      modal.setAttribute('modal-type', 'popup');
      modal.update({state: STATE_OPEN});
      window.requestAnimationFrame(() => {
        expect(modal.shadowRoot.querySelector('.mp-modal-backdrop')).to.equal(null);
        done();
      });
    });
  });

  describe('test life-cycle', () => {

    it('animates open', done => {
      const animations = ['fadeModalIn', 'fadeOverlayIn'];
      const animationEnd = e => {
        const idx = animations.indexOf(e.animationName)
        if (idx === -1) {
          throw Error(`Unexpected animation '${e.animationName}'`);
        }
        animations.splice(idx, 1);
        if (animations.length === 0) {
          offAnimationEnd(modal, animationEnd);
          done();
        }
      };
      onAnimationEnd(modal, animationEnd);
      modal.open();
    });

    it('animates closed', done => {
      modal.update({state: STATE_OPEN});
      const animations = ['fadeModalOut', 'fadeOverlayOut'];
      const animationEnd = e => {
        const idx = animations.indexOf(e.animationName)
        if (idx === -1) {
          throw Error(`Unexpected animation '${e.animationName}'`);
        }
        animations.splice(idx, 1);
        if (animations.length === 0) {
          offAnimationEnd(modal, animationEnd);
          done();
        }
      };
      onAnimationEnd(modal, animationEnd);
      modal.close();
    });

    it('fires "change" event when open is complete', done => {
      modal.addEventListener('change', e => {
        if (e.detail.state === STATE_OPEN) {
          done();
        }
      });
      modal.open();
    });

    it('fires "change" event when close is complete', done => {
      modal.update({state: STATE_OPEN});
      modal.addEventListener('change', e => {
        if (e.detail.state === STATE_CLOSED) {
          done();
        }
      });
      modal.close();
    });
  });

  describe('test full integration', () => {
    it('attaches in a closed state', () => {
      expect(modal.state.state).to.equal(STATE_CLOSED);
    });

    it('is visible after "open()" is called', done => {
      modal.addEventListener('change', e => {
        if (e.detail.state === STATE_OPEN) {
          setTimeout(() => {
            const modalRoot = modal.shadowRoot.querySelector('.mp-modal-stage');
            expect(modalRoot.classList.contains('mp-modal-closed')).to.equal(false);
            expect(window.getComputedStyle(modalRoot).display).to.equal('block');
            done();
          }, 0);
        }
      });
      modal.open();
    });

    it('is invisible after "close()" is called', done => {
      modal.update({state: STATE_OPEN});
      modal.addEventListener('change', e => {
        if (e.detail.state === STATE_CLOSED) {
          setTimeout(() => {
            const modalRoot = modal.shadowRoot.querySelector('.mp-modal-stage');
            expect(modalRoot.classList.contains('mp-modal-closed')).to.equal(true);
            expect(window.getComputedStyle(modalRoot).display).to.equal('none');
            done();
          }, 0);
        }
      });
      modal.close();
    });
  });
});
