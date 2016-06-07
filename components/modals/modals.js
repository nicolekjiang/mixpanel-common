import WebComponent from 'webcomponent';

import css from './modals.styl';

const template = `
  <div class="mp-modal">
    <div class="backdrop"></div>
    <div class="modal-container">
      <div class="top-container">
        <content select="[slot-title]"></content>
        <content select="[slot-body]"></content>
      </div>
      <div class="button-container">
        <content select="[slot-button]"></content>
      </div>
    </div>
  </div>
`;

document.registerElement('mp-modal', class MPModal extends WebComponent {
  attachedCallback() {
    this.root = this.createShadowRoot();
    this.root.innerHTML = `
      <style>${css}</style>
      ${template}
    `;
  }
});
