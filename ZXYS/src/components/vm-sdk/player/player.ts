import { RTCPlayer } from './rtcplayer-wrapper'

const player = new RTCPlayer()

export enum PlayerEvents {
  play = 'play',
  playing = 'playing',
  waiting = 'waiting',
  stop = 'stop',
  playNotAllowed = 'not-allowed',
  error = 'error',
}

player
  ?.on(PlayerEvents.play, () => {
    console.log('sdk event: player play')
  })
  .on(PlayerEvents.waiting, () => {
    console.log('sdk event: player waiting')
  })
  .on(PlayerEvents.playing, () => {
    console.log('sdk event: player playing')
  })
  .on(PlayerEvents.playNotAllowed, () => {
    console.log('sdk event: play not allowed, muted play')
  })

player.playerType = 12

export type IXRTCStreamInfo = {
  sid?: string
  server: string
  auth: string
  appid: string
  timeStr: string
  userId: string
  roomId: string
}

export type IWebRTCStreamInfo = {
  sid?: string
  streamUrl: string
}

player.videoSize = { '1280': '720' } //","?":"

player.container = document.querySelector('#playerWrapper') //设置id为palyerWrapper的div，此div是渲染区域

player.play()
