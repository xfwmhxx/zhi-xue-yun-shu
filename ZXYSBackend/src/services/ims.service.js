// services/ims.service.js
const logger = require('../utils/logger');

class ImsServiceImpl {
    constructor(aiAgentService) {
        this.aiAgentService = aiAgentService;
    }

    /**
     * 获取RTC认证令牌
     */
    async getRtcAuthToken(dto) {
        try {
            logger.info('ImsServiceImpl.getRtcAuthToken called:', dto);
            const result = await this.aiAgentService.getRtcAuthToken(
                dto.user_id,
                dto.channel_id
            );
            return result;
        } catch (error) {
            logger.error('getRtcAuthToken error:', error);
            throw error;
        }
    }

    /**
     * 生成消息聊天令牌
     */
    async generateMessageChatToken(requestDto) {
        try {
            logger.info('ImsServiceImpl.generateMessageChatToken called:', requestDto);
            const result = await this.aiAgentService.generateMessageChatToken(
                requestDto.ai_agent_id,
                requestDto.role,
                requestDto.user_id,
                requestDto.expire,
                requestDto.region
            );
            return result;
        } catch (error) {
            logger.error('generateMessageChatToken error:', error);
            throw error;
        }
    }

    /**
     * 描述AI代理实例
     */
    async describeAiAgentInstance(aiAgentDescribeRequestDto) {
        try {
            logger.info('ImsServiceImpl.describeAiAgentInstance called:', {
                ai_agent_instance_id: aiAgentDescribeRequestDto.ai_agent_instance_id,
                region: aiAgentDescribeRequestDto.region
            });
            
            const result = await this.aiAgentService.describeAiAgentInstance(
                aiAgentDescribeRequestDto.ai_agent_instance_id,
                aiAgentDescribeRequestDto.region
            );
            return result;
        } catch (error) {
            logger.error('describeAiAgentInstance error:', error);
            throw error;
        }
    }

    /**
     * 生成AI智能体实例
     * 对应Java：没有这个方法，直接返回成功
     */
    async generateAIAgentCall(requestDto) {
        try {
            logger.info('ImsServiceImpl.generateAIAgentCall called:', {
                user_id: requestDto.user_id,
                ai_agent_id: requestDto.ai_agent_id,
                region: requestDto.region
            });
            
            const result = await this.aiAgentService.generateAIAgentCall({
                user_id: requestDto.user_id,
                ai_agent_id: requestDto.ai_agent_id,
                workflow_type: requestDto.workflow_type,
                template_config: requestDto.template_config,
                agent_config: requestDto.agent_config,
                expire: requestDto.expire,
                region: requestDto.region,
                session_id: requestDto.session_id,
                chat_sync_config: requestDto.chat_sync_config,
                user_data: requestDto.user_data
            });
            return result;
        } catch (error) {
            logger.error('generateAIAgentCall error:', error);
            throw error;
        }
    }

    /**
     * 批量生成消息聊天令牌
     */
    async batchGenerateMessageChatToken(requests) {
        try {
            logger.info('ImsServiceImpl.batchGenerateMessageChatToken called, count:', requests?.length);
            const promises = requests.map(req => 
                this.generateMessageChatToken(req).catch(error => ({
                    success: false,
                    error: error.message
                }))
            );
            return Promise.all(promises);
        } catch (error) {
            logger.error('batchGenerateMessageChatToken error:', error);
            throw error;
        }
    }
}

module.exports = ImsServiceImpl;