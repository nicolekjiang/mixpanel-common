import { Component } from 'panel';

export default class extends Component {
  get disabled() {
    return this.isAttributeEnabled('disabled');
  }

  set disabled(disabled) {
    this.setAttribute('disabled', disabled);
  }

  attachedCallback() {
    super.attachedCallback(...arguments);

    // don't dispatch click event if disabled
    this._clickHandler = (e) => {
      if (this.isAttributeEnabled('disabled')) {
        e.stopImmediatePropagation();
      }
    };
    this.el.addEventListener('click', this._clickHandler);
  }

  detachedCallback() {
    super.detachedCallback(...arguments);
    this.el.removeEventListener('click', this._clickHandler);
    this._clickHandler = null;
  }
}
