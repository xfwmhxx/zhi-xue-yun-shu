/**
 * 生成AI智能体实例请求DTO
 * 对应前端 standard.ts 中的请求参数
 */

const { body } = require('express-validator');

class GenerateAIAgentCallRequestDto {
    constructor(data = {}) {
        this.user_id = data.user_id;
        this.ai_agent_id = data.ai_agent_id;
        this.workflow_type = data.workflow_type;
        this.template_config = data.template_config;
        this.agent_config = data.agent_config;
        this.expire = data.expire;
        this.region = data.region;
        this.session_id = data.session_id;
        this.chat_sync_config = data.chat_sync_config;
        this.user_data = data.user_data;
    }

    static fromRequest(body) {
        return new GenerateAIAgentCallRequestDto(body);
    }

    static validators() {
        // ✅ 返回数组
        return [
            body('user_id')
                .notEmpty()
                .withMessage('用户ID不能为空')
                .isString()
                .withMessage('用户ID必须是字符串'),
            
            body('ai_agent_id')
                .optional()
                .isString()
                .withMessage('AI代理ID必须是字符串'),
            
            body('workflow_type')
                .optional()
                .isInt()
                .withMessage('工作流类型必须是整数'),
            
            body('region')
                .optional()
                .isString()
                .withMessage('区域必须是字符串'),
            
            body('expire')
                .optional()
                .isInt({ min: 60, max: 86400 })
                .withMessage('过期时间必须在60-86400秒之间'),
        ];
    }
}

module.exports = GenerateAIAgentCallRequestDto;