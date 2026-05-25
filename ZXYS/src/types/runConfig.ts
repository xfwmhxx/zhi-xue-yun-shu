import { AICallAgentConfig } from 'aliyun-auikit-aicall'

import type { AICallRunConfig } from './interface'

// 如果需要自定义 AgentConfig，请参考以下写法
// when you need to customize AgentConfig, please refer to the following code

const callAgentConfig = new AICallAgentConfig()
// callAgentConfig.agentGreeting = 'Custom Greeting';
const BackendUrl = import.meta.env.VITE_API_URL
const runConfig: AICallRunConfig = {
  region: 'cn-hangzhou',
  // 应用服务器地址，格式示例 https://xxxx.domain.com
  // Your Application Server Address
  appServer: BackendUrl,

  // 您的语音通话智能体id
  // Your Voice Agent Id
  voiceAgentId: '70f48e00f4d54eb58fcc7f6b14e41554',
  // 您的数字人智能体id
  // Your Avatar Agent Id
  avatarAgentId: '70f48e00f4d54eb58fcc7f6b14e41554',
  // 您的视觉智能体id
  // Your Vision Agent Id
  visionAgentId: '70f48e00f4d54eb58fcc7f6b14e41554',
  // 您的视频通话智能体id
  // Your Video Agent Id
  videoAgentId: '70f48e00f4d54eb58fcc7f6b14e41554',

  // 您的消息通话智能体id
  // Your Chat Agent Id
  chatAgentId: 'ChatAgentId',

  callAgentConfig: callAgentConfig,
}

export default runConfig
