// services/interfaces/ims.service.interface.js

/**
 * IMS管理服务接口
 * 对应Java的ImsService接口
 * 
 * @interface ImsService
 */

/**
 * 获取RTC认证令牌
 * @function
 * @name getRtcAuthToken
 * @param {RtcAuthTokenRequestDto} rtcAuthTokenRequestDto - RTC认证令牌请求DTO
 * @returns {Promise<RtcAuthTokenResponse>} RTC认证令牌响应
 * 
 * @typedef {Object} RtcAuthTokenResponse
 * @property {string} auth_token - RTC认证令牌
 * @property {number} timestamp - 时间戳
 * @property {string} channel_id - 频道ID
 */

/**
 * 生成消息聊天令牌
 * @function
 * @name generateMessageChatToken
 * @param {GenerateMessageChatTokenRequestDto} requestDto - 生成聊天令牌请求DTO
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
 * 描述AI代理实例
 * @function
 * @name describeAiAgentInstance
 * @param {AiAgentInstanceDescribeRequestDto} aiAgentDescribeRequestDto - AI代理实例描述请求DTO
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
 * @param {GenerateAIAgentCallRequestDto} requestDto - 生成AI智能体实例请求DTO
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
 * 批量生成消息聊天令牌
 * @function
 * @name batchGenerateMessageChatToken
 * @param {Array<GenerateMessageChatTokenRequestDto>} requests - 请求数组
 * @returns {Promise<Array>} 批量结果数组
 */

module.exports = {
    interfaceName: 'ImsService',
    description: 'IMS管理服务接口，提供AI智能体管理、令牌生成等功能',
    version: '1.0.0',
    methods: [
        {
            name: 'getRtcAuthToken',
            description: '获取RTC认证令牌',
            params: ['rtcAuthTokenRequestDto']
        },
        {
            name: 'generateMessageChatToken',
            description: '生成消息聊天令牌',
            params: ['requestDto']
        },
        {
            name: 'describeAiAgentInstance',
            description: '描述AI代理实例',
            params: ['aiAgentDescribeRequestDto']
        },
        {
            name: 'generateAIAgentCall',
            description: '生成AI智能体实例',
            params: ['requestDto']
        },
        {
            name: 'batchGenerateMessageChatToken',
            description: '批量生成消息聊天令牌',
            params: ['requests']
        }
    ]
};