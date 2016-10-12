/* global beforeEach, describe, it */
import expect from 'expect.js';
import 'webcomponents.js/webcomponents';

import '../../lib/components/modals/modal'
import { onAnimationEnd, offAnimationEnd } from '../../lib/components/utils';

const VISIBILITY_OPEN = 'open';
const VISIBILITY_OPENING = 'opening';
const VISIBILITY_CLOSED = 'closed';
const VISIBILITY_CLOSING = 'closing';

describe('Test mixpanel-common modal component', () => {
  let modal;
  beforeEach(done => {
    modal = document.createElement('mp-modal');
    document.body.appendChild(modal);
    window.requestAnimationFrame(() => done());
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('imperative API', () => {
    it('opens when "open()" is called', () => {
      modal.open();
      expect(modal.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it('closes when "close()" is called', () => {
      modal.update({state: VISIBILITY_OPEN});
      modal.close();
      expect(modal.state.visibility).to.equal(VISIBILITY_CLOSING);
    });

    it('opens when "open()" is called before close animation completes', () => {
      modal.update({state: VISIBILITY_OPEN});
      modal.close();
      expect(modal.state.visibility).to.equal(VISIBILITY_CLOSING);
      modal.open();
      expect(modal.state.visibility).to.equal(VISIBILITY_OPEN);
    });

    it('closes when "close()" is called before open animation completes', () => {
      modal.open();
      expect(modal.state.visibility).to.equal(VISIBILITY_OPENING);
      modal.close();
      expect(modal.state.visibility).to.equal(VISIBILITY_CLOSED);
    });
  });

  describe('"closed" attribute', () => {
   it('immediately opens when set to "false" before it is attached', () => {
      document.body.removeChild(modal);
      modal.setAttribute('closed', 'false');
      document.body.appendChild(modal);
      expect(modal.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it('opens when set to "false"', () => {
      modal.setAttribute('closed', 'false');
      expect(modal.state.visibility).to.equal(VISIBILITY_OPENING);
    });

    it('closes when set to "true"', () => {
      modal.setAttribute('closed', 'false');
      modal.update({state: VISIBILITY_OPEN});
      modal.setAttribute('closed', 'true');
      expect(modal.state.visibility).to.equal(VISIBILITY_CLOSING);
    });
  });

  describe('"closeable" attribute', () => {
    it('does not close when clicked outside when not enabled', done => {
      modal.setAttribute('closeable', 'false');
      modal.update({state: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        modal.shadowRoot.querySelector('.mp-modal-backdrop').dispatchEvent(new MouseEvent('click'));
        expect(modal.state.visibility).to.equal(VISIBILITY_OPEN);
        done();
      });
    });

    it('closes when clicked outside when enabled', done => {
      modal.setAttribute('closeable', 'true');
      modal.update({state: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        modal.shadowRoot.querySelector('.mp-modal-backdrop').dispatchEvent(new MouseEvent('click'));
        expect(modal.state.visibility).to.equal(VISIBILITY_CLOSING);
        done();
      });
    });

    it('does not have a close button when not enabled', done => {
      modal.setAttribute('closeable', 'false');
      modal.update({state: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        expect(modal.shadowRoot.querySelector('mp-modal-close-btn')).to.equal(null);
        done();
      });
    });

    it('has a close button when enabled', done => {
      modal.setAttribute('closeable', 'true');
      modal.update({state: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        expect(modal.shadowRoot.querySelector('.mp-modal-close-btn')).to.not.equal(null);
        done();
      });
    });
  });

  describe('"modal-type" attribute', () => {
    it('does take over the screen if the "modal-type" is modal', done => {
      modal.setAttribute('modal-type', 'modal');
      modal.update({state: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        expect(modal.shadowRoot.querySelector('.mp-modal-backdrop')).to.not.equal(null);
        done();
      });
    });

    it('does not take over the screen if the "modal-type" is popup', done => {
      modal.setAttribute('modal-type', 'popup');
      modal.update({state: VISIBILITY_OPEN});
      window.requestAnimationFrame(() => {
        expect(modal.shadowRoot.querySelector('.mp-modal-backdrop')).to.equal(null);
        done();
      });
    });
  });

  describe('life-cycle', () => {

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
      modal.update({state: VISIBILITY_OPEN});
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
        if (e.detail.state === VISIBILITY_OPEN) {
          done();
        }
      });
      modal.open();
    });

    it('fires "change" event when close is complete', done => {
      modal.update({state: VISIBILITY_OPEN});
      modal.addEventListener('change', e => {
        if (e.detail.state === VISIBILITY_CLOSED) {
          done();
        }
      });
      modal.close();
    });
  });

  describe('full integration', () => {
    it('attaches in a closed state', () => {
      expect(modal.state.visibility).to.equal(VISIBILITY_CLOSED);
    });

    it('is visible after "open()" is called', done => {
      modal.addEventListener('change', e => {
        if (e.detail.state === VISIBILITY_OPEN) {
          window.requestAnimationFrame(() => {
            const modalRoot = modal.shadowRoot.querySelector('.mp-modal-stage');
            expect(modalRoot.classList.contains('mp-modal-closed')).to.equal(false);
            expect(window.getComputedStyle(modalRoot).display).to.equal('block');
            done();
          });
        }
      });
      modal.open();
    });

    it('is invisible after "close()" is called', done => {
      modal.update({state: VISIBILITY_OPEN});
      modal.addEventListener('change', e => {
        if (e.detail.state === VISIBILITY_CLOSED) {
          window.requestAnimationFrame(() => {
            const modalRoot = modal.shadowRoot.querySelector('.mp-modal-stage');
            expect(modalRoot.classList.contains('mp-modal-closed')).to.equal(true);
            expect(window.getComputedStyle(modalRoot).display).to.equal('none');
            done();
          });
        }
      });
      modal.close();
    });
  });
});
