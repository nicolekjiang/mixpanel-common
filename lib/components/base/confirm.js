import { Component } from 'panel';

export default class extends Component {
  get config() {
    return {
      useShadowDom: true,
      helpers: {
        cancel: () => {
          const e = new CustomEvent(`submit`, {detail: {action: `cancel`}});
          this.dispatchEvent(e);
          if (!e.defaultPrevented) {
            this.setAttribute(`open`, false);
          }
        },
        confirm: () => {
          const e = new CustomEvent(`submit`, {detail: {action: `confirm`}});
          this.dispatchEvent(e);
          if (!e.defaultPrevented) {
            this.setAttribute(`open`, false);
          }
        },
      },
    };
  }
}
