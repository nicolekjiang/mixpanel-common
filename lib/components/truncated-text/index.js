import WebComponent from 'webcomponent';

import { registerMPElement } from '../../util/register-element.js';
import { truncateToElement } from '../../util';
import throttle from 'lodash/throttle';

const activeElems = new Set();
const updateElems = throttle(() => activeElems.forEach(elem => elem.updateText()), 200);
setInterval(updateElems, 500);
window.addEventListener(`resize`, updateElems);

registerMPElement(`mp-truncated-text`, class extends WebComponent {
  updateText(force) {
    var newWidth = this.clientWidth;
    if(!force && this.width === newWidth) {
      return;
    }
    this.width = newWidth;
    this.innerText = truncateToElement(this.getAttribute(`title`), this);
  }

  attributeChangedCallback() {
    this.updateText(true);
  }

  attachedCallback() {
    this.updateText(true);
    activeElems.add(this);
  }

  detachedCallback() {
    activeElems.delete(this);
  }
});

