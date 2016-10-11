/* global beforeEach, describe, it */
import expect from 'expect.js';

import '../../lib/components/modals/modal.js'

describe('Test mixpanel-common modal component', () => {

  const expectOpen = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const modalRoot = modal.shadowRoot.querySelector('.mp-modal-stage');
        expect(modal.state.closed).to.equal(false);
        expect(modalRoot.classList.contains('mp-modal-close')).to.equal(false);
        expect(window.getComputedStyle(modalRoot).display).to.equal('block');
        resolve();
      }, 0);
    });
  };

  const expectClosed = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const modalRoot = modal.shadowRoot.querySelector('.mp-modal-stage');
        expect(modal.state.closed).to.equal(true);
        expect(modalRoot.classList.contains('mp-modal-closed')).to.equal(true);
        expect(window.getComputedStyle(modalRoot).display).to.equal('none');
        resolve();
      }, 0);
    });
  };

  let modal;
  beforeEach(() => {
    modal = document.createElement('mp-modal');
    document.body.appendChild(modal);
  });

  afterEach(() => {
    document.body.removeChild(modal);
  });

  it('attaches in a closed state', done => {
    expectClosed().then(done);
  });

  it('immediately opens when the "closed" attribute is "false" before it is attached', done => {
    document.body.removeChild(modal);
    modal.setAttribute('closed', 'false');
    modal.addEventListener('change', e => {
      if (e.detail.state === 'open') {
        expectOpen().then(done);
      }
    });
    document.body.appendChild(modal);
  });

  it('opens when "open()" is called', done => {
    modal.addEventListener('change', e => {
      if (e.detail.state === 'open') {
        expectOpen().then(done);
      }
    });
    modal.open();
  });

  it('closes when "close()" is called', done => {
    modal.open();
    modal.addEventListener('change', e => {
      if (e.detail.state === 'closed') {
        expectClosed().then(done);
      }
    });
    modal.close();
  });

  it('opens when the "closed" attribute is set to "false"', done => {
    modal.addEventListener('change', e => {
      if (e.detail.state === 'open') {
        expectOpen().then(done);
      }
    });
    modal.setAttribute('closed', 'false');
  });

  it('closes when the "closed" attribute is set to "true"', done => {
    modal.setAttribute('closed', 'false');
    modal.addEventListener('change', e => {
      if (e.detail.state === 'closed') {
        expectClosed().then(done);
      }
    });
    modal.setAttribute('closed', 'true');
  });

  it('does not close when clicked outside by default', done => {
    modal.addEventListener('change', e => {
      if (e.detail.state === 'open') {
        expectOpen().then(() => {
          modal.shadowRoot.querySelector('.mp-modal-backdrop').dispatchEvent(new MouseEvent('click'));
          setTimeout(function() {
            expectOpen().then(done);
          }, 1000);
        });
      }
    });
    modal.open();
  });

  it('closes when clicked outside when the "closeable" attribute is enabled', done => {
    modal.addEventListener('change', e => {
      switch(e.detail.state) {
        case 'open':
          modal.shadowRoot.querySelector('.mp-modal-backdrop').dispatchEvent(new MouseEvent('click'));
          break;
        case 'closed':
          expectClosed().then(done);
          break;
      }
    });
    modal.setAttribute('closeable', 'true');
    modal.setAttribute('closed', 'false');
  });

  it('does not have a close button by default', done => {
    modal.addEventListener('change', e => {
      if (e.detail.state === 'open') {
        expect(modal.shadowRoot.querySelector('mp-modal-close-btn')).to.equal(null);
        done();
      }
    });
    modal.setAttribute('closed', 'false');
  });

  it('has a close button when the "closeable" attribute is enabled', done => {
    modal.addEventListener('change', e => {
      if (e.detail.state === 'open') {
        expect(modal.shadowRoot.querySelector('.mp-modal-close-btn')).to.not.equal(null);
        done();
      }
    });
    modal.setAttribute('closeable', 'true');
    modal.setAttribute('closed', 'false');
  });

  it('does takes over the screen if the "modal-type" is modal', done => {
      modal.addEventListener('change', e => {
      if (e.detail.state === 'open') {
        expect(modal.shadowRoot.querySelector('.mp-modal-backdrop')).to.not.equal(null);
        done();
      }
    });
    modal.setAttribute('modal-type', 'modal');
    modal.setAttribute('closed', 'false');
  });

  it('does not take over the screen if the "modal-type" is popup', done => {
      modal.addEventListener('change', e => {
      if (e.detail.state === 'open') {
        expect(modal.shadowRoot.querySelector('.mp-modal-backdrop')).to.equal(null);
        done();
      }
    });
    modal.setAttribute('modal-type', 'popup');
    modal.setAttribute('closed', 'false');
  });
});
