/* global beforeEach, describe, it */
import expect from 'expect.js';

import { onAnimationEnd, offAnimationEnd } from '../../lib/util/dom';
import '../../lib/widgets/bookmarks-widget';
import bookmarks from './bookmark-data.json';

describe('Test bookmarks-widget', function() {
  beforeEach(function(done) {
    document.body.innerHTML = '';
    this.widget = document.createElement('mp-bookmarks-widget');
    this.widget.setAttribute('bookmarks', JSON.stringify(bookmarks));
    document.body.appendChild(this.widget);
    window.requestAnimationFrame(() => {
      this.dropMenu = this.widget.el.querySelector('mp-drop-menu');
      window.requestAnimationFrame(() => done());
    });
  });

  it('opens when open is true', function(done) {
    expect(this.dropMenu.isAttributeEnabled('open')).not.to.be.ok();

    onAnimationEnd(this.dropMenu, () => {
      expect(this.dropMenu.isAttributeEnabled('open')).to.be.ok();
      done();
    });
    this.widget.setAttribute('open', 'true');
  });

  it('activates the selected-bookmark-id when opened', function(done) {
    this.widget.setAttribute('selected-bookmark-id', 4);
    onAnimationEnd(this.dropMenu, () => {
      expect(this.widget.el.querySelector('mp-list-item[active=true] .mp-bm-menu-name').innerText).to.equal('Signups');
      done();
    });
    this.widget.setAttribute('open', 'true');
  });

  it('sorts bookmarks by selected user and then alphabetically', function(done) {
    this.widget.setAttribute('user-id', 1);
    onAnimationEnd(this.dropMenu, () => {
      expect(this.widget.state.bookmarks).to.eql([{id: 1, user_id: 1, include_in_dashboard: true, user: 'John D.', name: 'most addicted users'}, {id: 2, user_id: 1, include_in_dashboard: false, user: 'John D.', name: 'least addicted users'}, {id: 3, user_id: 1, include_in_dashboard: true, user: 'John D.', name: 'Growth line graph'}, {id: 13, user_id: 2, include_in_dashboard: false, user: 'Josh W.', name: 'Signups better'}, {id: 4, user_id: 1, include_in_dashboard: false, user: 'John D.', name: 'Signups'}, {id: 5, user_id: 4, include_in_dashboard: true, user: 'Ilya K.', name: 'Some bookmark 1'}, {id: 6, user_id: 4, include_in_dashboard: false, user: 'Ilya K.', name: 'Some bookmark 2'}, {id: 7, user_id: 4, include_in_dashboard: true, user: 'Ilya K.', name: 'Another bookmark 1'}, {id: 8, user_id: 4, include_in_dashboard: false, user: 'Ilya K.', name: 'Another bookmark 2'}, {id: 9, user_id: 3, include_in_dashboard: true, user: 'Ted D.', name: 'Ted\'s most excellent adventure'}, {id: 10, user_id: 3, include_in_dashboard: false, user: 'Ted D.', name: 'Down and to the left baby'}, {id: 11, user_id: 3, include_in_dashboard: true, user: 'Ted D.', name: 'Hi my name is Ted and I\'m a.'}, {id: 12, user_id: 3, include_in_dashboard: false, user: 'Ted D.', name: 'Retention retention retention retention!'}]);
      done();
    });
    this.widget.setAttribute('open', 'true');
  });
});
