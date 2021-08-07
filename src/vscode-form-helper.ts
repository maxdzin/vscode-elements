import {css, CSSResultGroup, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import {applyForegroundRGBA} from './includes/themeHelpers';
import formHelperTextStyles from './includes/formHelperTextStyles';

@customElement('vscode-form-helper')
export class VscodeFormHelper extends LitElement {
  constructor() {
    super();
    applyForegroundRGBA();
  }

  static get styles(): CSSResultGroup[] {
    const baseStyles = css`
      :host {
        color: var(--vsc-foreground-translucent);
        display: block;
        margin-bottom: 4px;
        margin-top: 4px;
        max-width: 720px;
      }

      :host([vertical]) {
        margin-left: 0;
      }
    `;

    return [baseStyles, formHelperTextStyles];
  }

  render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-form-helper': VscodeFormHelper;
  }
}
