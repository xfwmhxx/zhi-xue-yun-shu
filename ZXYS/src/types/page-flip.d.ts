declare module 'page-flip' {
  export interface PageFlipOptions {
    width: number
    height: number
    size: 'fixed' | 'stretch'
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    showCover?: boolean
    drawShadow?: boolean
    maxShadowOpacity?: number
    flippingTime?: number
    useMouseEvents?: boolean
    swipeDistance?: number
    clickEventForward?: boolean
    mobileScrollSupport?: boolean
  }

  export interface PageFlipEvent {
    data: number
  }

  export class PageFlip {
    constructor(container: HTMLElement, options: PageFlipOptions)
    loadFromHTML(pages: NodeListOf<Element>): void
    flipPrev(): void
    flipNext(): void
    flip(page: number): void
    getCurrentPageIndex(): number
    getPageCount(): number
    on(event: string, callback: (e: PageFlipEvent) => void): void
    update(): void
    destroy(): void
  }

  // 如果 PageFlip 是默认导出
  export default PageFlip

  // 或者，如果 PageFlip 是命名导出
  export { PageFlip }
}
