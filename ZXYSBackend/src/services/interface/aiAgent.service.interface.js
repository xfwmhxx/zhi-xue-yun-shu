// services/interfaces/aiAgent.service.interface.js

/**
 * AI代理服务接口
 * 对应Java的AiAgentService接口
 * 
 * @interface AiAgentService
 */

/**
 * 生成消息聊天令牌
 * @function
 * @name generateMessageChatToken
 * @param {Object} dto - 请求参数
 * @param {string} dto.ai_agent_id - AI代理ID
 * @param {string} dto.role - 角色 (user/assistant/system)
 * @param {string} dto.user_id - 用户ID
 * @param {number} dto.expire - 过期时间（秒）
 * @param {string} dto.region - 区域 (如: cn-hangzhou)
 * @returns {Promise<GenerateMessageChatTokenResponse>} 聊天令牌响应
 * 
 * @typedef {Object} GenerateMessageChatTokenResponse
 * @property {number} code - 状态码
 * @property {string} app_id - 应用ID
 * @property {string} token - 聊天令牌
 * @property {string} user_id - 用户ID
 * @property {string} nonce - 随机数
 * @property {string} role - 角色
 * @property {number} timestamp - 时间戳
 * @property {string} app_sign - 应用签名
 * @property {string} request_id - 请求ID
 */

/**
 * 获取RTC认证令牌
 * @function
 * @name getRtcAuthToken
 * @param {Object} dto - 请求参数
 * @param {string} dto.channel_id - 频道ID
 * @param {string} dto.user_id - 用户ID
 * @returns {Promise<RtcAuthTokenResponse>} RTC认证令牌响应
 * 
 * @typedef {Object} RtcAuthTokenResponse
 * @property {string} auth_token - RTC认证令牌
 * @property {number} timestamp - 时间戳
 * @property {string} channel_id - 频道ID
 */

/**
 * 描述AI代理实例
 * @function
 * @name describeAiAgentInstance
 * @param {Object} dto - 请求参数
 * @param {string} dto.ai_agent_instance_id - AI代理实例ID
 * @param {string} dto.region - 区域 (如: cn-hangzhou)
 * @returns {Promise<AiAgentInstanceDescribeResponse>} 实例描述响应
 * 
 * @typedef {Object} AiAgentInstanceDescribeResponse
 * @property {number} code - 状态码
 * @property {string} message - 消息
 * @property {string} request_id - 请求ID
 * @property {string} call_log_url - 通话日志URL
 * @property {Object} runtime_config - 运行时配置
 * @property {string} status - 状态
 * @property {Object} template_config - 模板配置
 * @property {string} user_data - 用户自定义数据
 */

/**
 * 生成AI智能体实例
 * @function
 * @name generateAIAgentCall
 * @param {Object} dto - 请求参数
 * @param {string} dto.user_id - 用户ID (必填)
 * @param {string} dto.ai_agent_id - AI代理ID (可选，与workflow_type二选一)
 * @param {number} dto.workflow_type - 工作流类型 (可选，与ai_agent_id二选一)
 * @param {string} dto.template_config - 模板配置 (JSON字符串，可选)
 * @param {string} dto.agent_config - 代理配置 (JSON字符串，可选)
 * @param {number} dto.expire - 过期时间 (秒，默认86400，可选)
 * @param {string} dto.region - 区域 (如: cn-hangzhou，可选)
 * @param {string} dto.session_id - 会话ID (可选)
 * @param {string} dto.chat_sync_config - 聊天同步配置 (JSON字符串，可选)
 * @param {string} dto.user_data - 用户自定义数据 (可选)
 * @returns {Promise<GenerateAIAgentCallResponse>} 智能体实例响应
 * 
 * @typedef {Object} GenerateAIAgentCallResponse
 * @property {number} code - 状态码 (200表示成功)
 * @property {string} ai_agent_instance_id - AI代理实例ID
 * @property {string} channel_id - 频道ID
 * @property {string} ai_agent_user_id - AI代理用户ID
 * @property {string} rtc_auth_token - RTC认证令牌
 * @property {string} request_id - 请求ID
 */

/**
 * 批量生成聊天令牌
 * @function
 * @name batchGenerateMessageChatToken
 * @param {Array<Object>} requests - 请求数组
 * @param {string} requests[].ai_agent_id - AI代理ID
 * @param {string} requests[].role - 角色
 * @param {string} requests[].user_id - 用户ID
 * @param {number} requests[].expire - 过期时间
 * @param {string} requests[].region - 区域
 * @returns {Promise<Array>} 批量结果数组
 */

// 导出接口定义（主要用于文档和类型提示）
module.exports = {
    interfaceName: 'AiAgentService',
    description: 'AI代理服务接口，提供智能体实例管理、令牌生成等功能',
    version: '1.0.0',
    methods: [
        {
            name: 'generateMessageChatToken',
            description: '生成消息聊天令牌',
            params: ['ai_agent_id', 'role', 'user_id', 'expire', 'region']
        },
        {
            name: 'getRtcAuthToken',
            description: '获取RTC认证令牌',
            params: ['channel_id', 'user_id']
        },
        {
            name: 'describeAiAgentInstance',
            description: '描述AI代理实例',
            params: ['ai_agent_instance_id', 'region']
        },
        {
            name: 'generateAIAgentCall',
            description: '生成AI智能体实例',
            params: ['user_id', 'ai_agent_id', 'workflow_type', 'region']
        },
        {
            name: 'batchGenerateMessageChatToken',
            description: '批量生成聊天令牌',
            params: ['requests']
        }
    ]
};