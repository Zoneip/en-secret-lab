/// <reference types="astro/client" />

declare module '@pagefind/default-ui' {
  interface PagefindUIOptions {
    element?: string | HTMLElement
    bundlePath?: string
    baseUrl?: string
    showSubResults?: boolean
    showImages?: boolean
    showEmptyFilters?: boolean
    resetStyles?: boolean
    translations?: Record<string, string>
    debouncedTimeout?: number
    mergeIndex?: boolean
    highlightParam?: string
    pageSize?: number
    sort?: Record<string, 'asc' | 'desc'>
  }

  export class PagefindUI {
    constructor(options?: PagefindUIOptions)
    destroy(): void
    triggerSearch(term?: string): void
  }
}

interface Window {
  toast: (msg: string, isError?: boolean) => void
}
