import { AICallAgentError, AICallErrorCode, AICallState } from 'aliyun-auikit-aicall'

import logger from '@/utils/AIYS/common/logger'
import AUIAICallAuthTokenHelper from './AUIAICallAuthTokenHelper'

import AUIAICallController from './AUIAICallController'

class AUIAICallProxyController extends AUIAICallController {
  async start(): Promise<void> {
    logger.info('ProxyController', 'Start')
    const startTs = Date.now()

    // @ts-ignore
    if (this.state === AICallState.Connected || this.state === AICallState.Connecting) return
    // @ts-ignore
    this.state = AICallState.Connecting

    // @ts-ignore
    this.addEngineListener()

    try {
      // @ts-ignore
      this.engine!.once('agentStarted', () => {
        // @ts-ignore
        const instanceInfo = this.engine!.agentInfo!
        logger.setParams({
          instanceId: instanceInfo.instanceId,
          channelId: instanceInfo.channelId,
          userId: instanceInfo.userId,
          reqId: instanceInfo.reqId || '-',
        })
        const elapsedTime = Date.now() - startTs
        logger.info('ProxyController', 'GenerateAIAgentSuccess', { value: elapsedTime })

        // @ts-ignore
        this._agentInfo = instanceInfo
        // @ts-ignore
        this.emit('AICallAIAgentStarted', instanceInfo, elapsedTime)
        // @ts-ignore
        this.describeAIAgentInstance(instanceInfo.instanceId)
      })

      // @ts-ignore
      this.engine!.once('callBegin', () => {
        const elapsedTime = Date.now() - startTs
        logger.info('ProxyController', 'StartSuccess', { value: elapsedTime })
        // @ts-ignore
        this.emit('AICallBegin', elapsedTime)
        // @ts-ignore
        this.state = AICallState.Connected
      })

      // @ts-ignore
      this.engine!.once('agentDataChannelAvailable', () => {
        const elapsedTime = Date.now() - startTs
        logger.info('ProxyController', 'AgentDataChannelAvailable', { value: elapsedTime })
      })

      const authToken = await AUIAICallAuthTokenHelper.shared.fetchAuthToken(this.userId)
      // @ts-ignore
      this.config.userJoinToken = authToken
      // @ts-ignore
      await this.engine!.callWithConfig(this.config)

      AUIAICallAuthTokenHelper.shared.requestNewAuthToken()

      // @ts-ignore
      if (this.engineConfig.agentElement) {
        // @ts-ignore
        this.engine?.setAgentView(this.engineConfig.agentElement)
      }

      // @ts-ignore
      if (this.state === AICallState.Over) {
        await this.handup()
        throw new AICallAgentError('call has been over')
      }
    } catch (error: any) {
      // @ts-ignore
      this._errorCode = error.code || error.errorCode || AICallErrorCode.BeginCallFailed
      // @ts-ignore
      this.state = AICallState.Error
      await this.handup()
      logger.error('StartCallFailed', error)
      throw error
    }
  }
}

export default AUIAICallProxyController
