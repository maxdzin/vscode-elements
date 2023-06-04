import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles';
import declareThemeVariables from '../includes/declareThemeVariables';

const styles: CSSResultGroup = [
  defaultStyles,
  declareThemeVariables([
    {
      componentProp: '--focus-border',
      vscodeProp: '--vscode-list-focusOutline',
    },
    {
      componentProp: '--font-family',
      vscodeProp: '--vscode-font-family',
    },
    {
      componentProp: '--font-size',
      vscodeProp: '--vscode-font-size',
    },
    {
      componentProp: '--font-weight',
      vscodeProp: '--vscode-font-weight',
    },
    {
      componentProp: '--hover-foreground',
      vscodeProp: '--vscode-list-hoverForeground',
    },
    {
      componentProp: '--hover-background',
      vscodeProp: '--vscode-list-hoverBackground',
    },
    {
      componentProp: '--inactive-selection-background',
      vscodeProp: '--vscode-list-inactiveSelectionBackground',
    },
    {
      componentProp: '--active-selection-background',
      vscodeProp: '--vscode-list-activeSelectionBackground',
    },
    {
      componentProp: '--active-selection-foreground',
      vscodeProp: '--vscode-list-activeSelectionForeground',
    },
    {
      componentProp: '--indent-guide',
      vscodeProp: '--vscode-tree-inactiveIndentGuidesStroke',
    },
    {
      componentProp: '--active-indent-guide',
      vscodeProp: '--vscode-tree-indentGuidesStroke',
    },
  ]),
  css`
    :host {
      display: block;
      outline: none;
      user-select: none;
    }

    .wrapper {
      height: 100%;
    }

    :host(:focus) .wrapper.focused-none {
      outline: 1px solid var(--focus-border);
    }

    li {
      list-style: none;
    }

    ul,
    li {
      margin: 0;
      padding: 0;
    }

    ul {
      position: relative;
    }

    :host([indent-guides]) ul ul:before {
      background-color: var(--indent-guide);
      content: '';
      display: block;
      height: 100%;
      position: absolute;
      bottom: 0;
      left: var(--indent-guide-pos);
      top: 0;
      pointer-events: none;
      width: 1px;
      z-index: 1;
    }

    .contents {
      align-items: center;
      display: flex;
      font-family: var(--font-family);
      font-size: var(--font-size);
      font-weight: var(--font-weight);
    }

    .multi .contents {
      align-items: flex-start;
    }

    .contents:hover {
      background-color: var(--hover-background);
      color: var(--hover-foreground);
      cursor: pointer;
    }

    .contents.selected {
      background-color: var(--inactive-selection-background);
    }

    :host(:focus) .contents.focused {
      background-color: var(--focus-background);
      outline: 1px solid var(--focus-border);
      outline-offset: -1px;
    }

    :host(:focus) .contents.selected.focused,
    :host(:focus) .contents.selected {
      background-color: var(--active-selection-background);
      color: var(--active-selection-foreground);
    }

    .icon-arrow {
      color: currentColor;
      display: block;
      margin: 3px 2px 3px 0;
    }

    .label-icon {
      display: block;
      margin-right: 6px;
    }

    :host(:focus) .contents.selected.focused .label-icon,
    :host(:focus) .contents.selected .label-icon {
      color: var(--active-selection-foreground);
    }

    .multi .contents .label-icon {
      margin-top: 3px;
    }

    .label {
      display: block;
      line-height: 22px;
    }

    .single .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
];

export default styles;
