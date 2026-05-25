// src/components/vm-sdk/player/rtcplayer-wrapper.ts

// ✅ 用 require 绕过 TS 的 import 检查
const RTCPlayerJS: any = require('./rtcplayer.esm.js')

// ✅ 手动声明类型
export const RTCPlayer = RTCPlayerJS as {
  new (options?: any): {
    on(event: string, callback: Function): any
    playerType: number
    videoSize: Record<string, string>
    container: HTMLElement | null
    play(): void
  }
}
