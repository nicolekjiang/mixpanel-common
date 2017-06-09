import '../../lib/components/tooltip';

describe('tooltip', function () {
  let tooltipEl;
  beforeEach(function (done) {
    tooltipEl = document.createElement(`mp-tooltip`);
    document.body.appendChild(tooltipEl);
    window.requestAnimationFrame(() => {
      done();
    });
  });
  it('should only call the raf callback once', function (done) {
    const sandbox = sinon.sandbox.create();
    sandbox.spy(tooltipEl, '_showAfterRAF');
    for(let i = 0; i < 6; ++i) {
      tooltipEl.dispatchEvent(new CustomEvent('mouseleave', {bubbles: true}));
      tooltipEl.dispatchEvent(new CustomEvent('mouseenter', {bubbles: true}));
    }
    window.requestAnimationFrame(() => {
      expect(tooltipEl._showAfterRAF.callCount).to.equal(1);
      expect(tooltipEl.state.visibility).to.equal(`visible`, `tooltip should be visible`);
      sandbox.restore();
      done();
    });
  });
  it('should not be showing when mouseout occurs before next animation frame', function (done) {
    tooltipEl.dispatchEvent(new CustomEvent('mouseenter', {bubbles: true}));
    tooltipEl.dispatchEvent(new CustomEvent('mouseleave', {bubbles: true}));
    window.requestAnimationFrame(() => {
      expect(tooltipEl.state.visibility).to.equal(`hidden`, `tooltip should be hidden`);
      done();
    });
  });
  it('should be showing when mouseover occurs before next animation frame', function (done) {
    tooltipEl.dispatchEvent(new CustomEvent('mouseleave', {bubbles: true}));
    tooltipEl.dispatchEvent(new CustomEvent('mouseenter', {bubbles: true}));
    window.requestAnimationFrame(() => {
      expect(tooltipEl.state.visibility).to.equal(`visible`, `tooltip should be visible`);
      done();
    });
  });
});
