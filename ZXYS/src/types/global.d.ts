// src/types/global.d.ts
export {}

declare global {
  interface Window {
    __debugDigitalHuman?: {
      debugInfo: () => void
      getVideoElement: () => HTMLVideoElement | null
      getConnectionStatus: () => any
      getAppState: () => any
      getAppStore: () => any
    }
  }
}
