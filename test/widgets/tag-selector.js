/* global beforeEach, describe, it */
import expect from 'expect.js';
import '../../lib/widgets/tag-selector';

const allTags = ['tag foo', 'tag bar', 'tag baz'];
const selectedTags = ['tag foo'];

const requestAnimationFrame = () => new Promise(resolve => window.requestAnimationFrame(resolve));
describe('Test tag-selector widget', () => {
  beforeEach(function(done) {
    document.body.innerHTML = '';
    this.widget = document.createElement('mp-tag-selector');
    this.widget.setAttribute('open', true);
    this.widget.setAttribute('all-tags', JSON.stringify(allTags));
    this.widget.setAttribute('selected-tags', JSON.stringify(selectedTags));
    this.widget.setAttribute('load-state', 'idle');

    document.body.appendChild(this.widget);

    // do to the interaction with some browsers and the webcomponent.js polyfill
    // as it relates to attributeChanged/attachedCallback we need to wait for two animation frames
    requestAnimationFrame().then(() => requestAnimationFrame()).then(() => done());
  });

  it('displays all tags that are not selected', function() {
    let displayedTags = [];
    const optionList = this.widget.el.querySelectorAll('mp-list-item');
    for (var i = 0; i < optionList.length; i++) {
        displayedTags.push(optionList[i].innerText);
    }
    expect(displayedTags).to.eql(['tag bar', 'tag baz']);
  });

  it('fires change event to add tags', function(done) {
    this.widget.addEventListener('change', e => {
      expect(e.detail.action).to.equal('addTag');
      expect(e.detail.tagName).to.equal('new tag');
      done();
    });
    const searchInput = this.widget.el.querySelector('.mp-tag-selector-search-input');
    searchInput.value = 'new tag';
    searchInput.dispatchEvent(new Event('input'));
    window.requestAnimationFrame(() => {
      const footer = this.widget.el.querySelector('.mp-tag-selector-footer');
      expect(footer).to.not.be(null);
      footer.dispatchEvent(new MouseEvent('click'));
    });
  }),

  it('fires change event to remove tags', function(done) {
    this.widget.addEventListener('change', e => {
      expect(e.detail.action).to.equal('removeTag');
      done();
    });
    this.widget.el.querySelector('.mp-tag-selector-close-icon svg-icon').dispatchEvent(new MouseEvent('click'));
  });
});
