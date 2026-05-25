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
 */

/**
 * 生成消息聊天令牌
 * @function
 * @name generateMessageChatToken
 * @param {GenerateMessageChatTokenRequestDto} requestDto - 生成聊天令牌请求DTO
 * @returns {Promise<GenerateMessageChatTokenResponse>} 聊天令牌响应
 */

/**
 * 描述AI代理实例
 * @function
 * @name describeAiAgentInstance
 * @param {AiAgentInstanceDescribeRequestDto} aiAgentDescribeRequestDto - AI代理实例描述请求DTO
 * @returns {Promise<AiAgentInstanceDescribeResponse>} 实例描述响应
 */

module.exports = {
    interfaceName: 'ImsService',
    methods: ['getRtcAuthToken', 'generateMessageChatToken', 'describeAiAgentInstance']
};