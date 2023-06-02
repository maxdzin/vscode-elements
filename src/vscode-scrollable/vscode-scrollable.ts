import { html, TemplateResult} from 'lit';
import {
  customElement,
  property,
  query,
  queryAssignedNodes,
  state,
} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {styleMap} from 'lit/directives/style-map.js';
import {VscElement} from '../includes/VscElement';
import styles from './vscode-scrollable.styles';

/**
 * @cssprop [--min-thumb-height=20px]
 * @cssprop [--scrollbar-shadow=var(--vscode-scrollbar-shadow)]
 * @cssprop [--scrollbar-slider-background=var(--vscode-scrollbarSlider-background)]
 * @cssprop [--scrollbar-slider-hover-background=var(--vscode-scrollbarSlider-hoverBackground)]
 * @cssprop [--scrollbar-slider-active-background=var(--vscode-scrollbarSlider-activeBackground')]
 */
@customElement('vscode-scrollable')
export class VscodeScrollable extends VscElement {
  static styles = styles;

  @property({type: Boolean, reflect: true})
  shadow = true;

  @property({type: Boolean, reflect: true})
  scrolled = false;

  @property({type: Number, attribute: 'scroll-pos'})
  set scrollPos(val: number) {
    this._scrollableContainer.scrollTop = val;
  }
  get scrollPos(): number {
    return this._scrollableContainer.scrollTop;
  }

  @property({type: Number, attribute: 'scroll-max'})
  get scrollMax(): number {
    return this._scrollableContainer.scrollHeight;
  }

  @state()
  private _isDragging = false;

  @state()
  private _thumbHeight = 0;

  @state()
  private _thumbY = 0;

  @state()
  private _thumbVisible = false;

  @state()
  private _thumbFade = false;

  @state()
  private _thumbActive = false;

  @query('.content')
  private _contentElement!: HTMLDivElement;

  @query('.scrollbar-thumb')
  private _scrollThumbElement!: HTMLDivElement;

  @query('.scrollable-container')
  private _scrollableContainer!: HTMLDivElement;

  @queryAssignedNodes()
  private _assignedNodes!: NodeList;

  private _resizeObserver!: ResizeObserver;
  private _scrollThumbStartY = 0;
  private _mouseStartY = 0;
  private _scrollbarVisible = true;
  private _scrollbarTrackZ = 0;

  connectedCallback(): void {
    super.connectedCallback();

    this._resizeObserver = new ResizeObserver(
      this._resizeObserverCallbackBound
    );

    this.requestUpdate();

    this.updateComplete.then(() => {
      this._scrollableContainer.addEventListener(
        'scroll',
        this._onScrollableContainerScroll.bind(this)
      );
      this._resizeObserver.observe(this._contentElement);
    });

    this.addEventListener('mouseover', this._onComponentMouseOverBound);
    this.addEventListener('mouseout', this._onComponentMouseOutBound);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this._resizeObserver.unobserve(this);
    this._resizeObserver.disconnect();

    this.removeEventListener('mouseover', this._onComponentMouseOverBound);
    this.removeEventListener('mouseout', this._onComponentMouseOutBound);
  }

  private _resizeObserverCallback() {
    this._updateScrollbar();
  }

  private _resizeObserverCallbackBound =
    this._resizeObserverCallback.bind(this);

  private _updateScrollbar() {
    const compCr = this.getBoundingClientRect();
    const contentCr = this._contentElement.getBoundingClientRect();

    if (compCr.height >= contentCr.height) {
      this._scrollbarVisible = false;
    } else {
      this._scrollbarVisible = true;
      this._thumbHeight = compCr.height * (compCr.height / contentCr.height);
    }

    this.requestUpdate();
  }

  private _zIndexFix() {
    let highestZ = 0;

    this._assignedNodes.forEach((n) => {
      if ('style' in n) {
        const computedZIndex = window.getComputedStyle(n as HTMLElement).zIndex;
        const isNumber = /([0-9-])+/g.test(computedZIndex);

        if (isNumber) {
          highestZ =
            Number(computedZIndex) > highestZ
              ? Number(computedZIndex)
              : highestZ;
        }
      }
    });

    this._scrollbarTrackZ = highestZ + 1;
    this.requestUpdate();
  }

  private _onSlotChange() {
    this._updateScrollbar();
    this._zIndexFix();
  }

  private _onScrollThumbMouseDown(event: MouseEvent) {
    const cmpCr = this.getBoundingClientRect();
    const thCr = this._scrollThumbElement.getBoundingClientRect();

    this._mouseStartY = event.screenY;
    this._scrollThumbStartY = thCr.top - cmpCr.top;
    this._isDragging = true;
    this._thumbActive = true;

    document.addEventListener('mousemove', this._onScrollThumbMouseMoveBound);
    document.addEventListener('mouseup', this._onScrollThumbMouseUpBound);
  }

  private _onScrollThumbMouseMove(event: MouseEvent) {
    const predictedPos =
      this._scrollThumbStartY + (event.screenY - this._mouseStartY);
    let nextPos = 0;
    const cmpH = this.getBoundingClientRect().height;
    const thumbH = this._scrollThumbElement.getBoundingClientRect().height;
    const contentH = this._contentElement.getBoundingClientRect().height;

    if (predictedPos < 0) {
      nextPos = 0;
    } else if (predictedPos > cmpH - thumbH) {
      nextPos = cmpH - thumbH;
    } else {
      nextPos = predictedPos;
    }

    this._thumbY = nextPos;
    this._scrollableContainer.scrollTop =
      (nextPos / (cmpH - thumbH)) * (contentH - cmpH);
  }

  private _onScrollThumbMouseMoveBound =
    this._onScrollThumbMouseMove.bind(this);

  private _onScrollThumbMouseUp(event: MouseEvent) {
    this._isDragging = false;
    this._thumbActive = false;

    const cr = this.getBoundingClientRect();
    const {x, y, width, height} = cr;
    const {pageX, pageY} = event;

    if (pageX > x + width || pageX < x || pageY > y + height || pageY < y) {
      this._thumbFade = true;
      this._thumbVisible = false;
    }

    document.removeEventListener(
      'mousemove',
      this._onScrollThumbMouseMoveBound
    );
    document.removeEventListener('mouseup', this._onScrollThumbMouseUpBound);
  }

  private _onScrollThumbMouseUpBound = this._onScrollThumbMouseUp.bind(this);

  private _onScrollableContainerScroll() {
    const scrollTop = this._scrollableContainer.scrollTop;
    this.scrolled = scrollTop > 0;

    const cmpH = this.getBoundingClientRect().height;
    const thumbH = this._scrollThumbElement.getBoundingClientRect().height;
    const contentH = this._contentElement.getBoundingClientRect().height;

    const overflown = contentH - cmpH;
    const ratio = scrollTop / overflown;

    this._thumbY = ratio * (cmpH - thumbH);
  }

  private _onComponentMouseOver() {
    this._thumbVisible = true;
    this._thumbFade = false;
  }

  private _onComponentMouseOverBound = this._onComponentMouseOver.bind(this);

  private _onComponentMouseOut() {
    if (!this._thumbActive) {
      this._thumbVisible = false;
      this._thumbFade = true;
    }
  }

  private _onComponentMouseOutBound = this._onComponentMouseOut.bind(this);

  render(): TemplateResult {
    return html`
      <div
        class="scrollable-container"
        style="${styleMap({
          'user-select': this._isDragging ? 'none' : 'auto',
        })}"
      >
        <div class="${classMap({shadow: true, visible: this.scrolled})}"></div>
        <div
          class="${classMap({
            'scrollbar-track': true,
            hidden: !this._scrollbarVisible,
          })}"
          style="${styleMap({
            'z-index': String(this._scrollbarTrackZ),
          })}"
        >
          <div
            class="${classMap({
              'scrollbar-thumb': true,
              visible: this._thumbVisible,
              fade: this._thumbFade,
              active: this._thumbActive,
            })}"
            style="${styleMap({
              height: `${this._thumbHeight}px`,
              top: `${this._thumbY}px`,
            })}"
            @mousedown=${this._onScrollThumbMouseDown}
          ></div>
        </div>
        <div class="content">
          <slot @slotchange="${this._onSlotChange}"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-scrollable': VscodeScrollable;
  }
}
