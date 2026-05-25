// dtos/aiAgentInstanceDescribeRequest.dto.js
const { body } = require('express-validator');

/**
 * AiAgentInstanceDescribeRequest DTO
 * 对应Java的AiAgentInstanceDescribeRequestDto
 */
class AiAgentInstanceDescribeRequestDto {
    constructor(data = {}) {
        this.user_id = data.user_id || data.userId || '';
        this.ai_agent_instance_id = data.ai_agent_instance_id || data.aiAgentInstanceId || '';
        this.region = data.region || '';
    }

    /**
     * 从请求体创建DTO实例
     * @param {Object} body - 请求体
     * @returns {AiAgentInstanceDescribeRequestDto}
     */
    static fromRequest(body) {
        const dto = new AiAgentInstanceDescribeRequestDto();
        
        // 支持两种命名风格（对应@JsonProperty）
        dto.user_id = body.user_id || body.userId || '';
        dto.ai_agent_instance_id = body.ai_agent_instance_id || body.aiAgentInstanceId || '';
        dto.region = body.region || '';
        
        return dto;
    }

    /**
     * 转换为普通对象
     * @returns {Object}
     */
    toJSON() {
        return {
            user_id: this.user_id,
            ai_agent_instance_id: this.ai_agent_instance_id,
            region: this.region
        };
    }

    /**
     * 获取用于服务的对象（使用驼峰命名）
     * @returns {Object}
     */
    toService() {
        return {
            userId: this.user_id,
            aiAgentInstanceId: this.ai_agent_instance_id,
            region: this.region
        };
    }

    /**
     * 验证规则（对应@NotBlank）
     */
    static validators() {
        return [
            body('user_id')
                .notEmpty().withMessage('用户id不能为空')
                .isString().withMessage('用户id必须是字符串'),
            
            body('ai_agent_instance_id')
                .notEmpty().withMessage('机器人实例id不能为空')
                .isString().withMessage('机器人实例id必须是字符串'),
            
            body('region')
                .optional() // 可为空
                .isString().withMessage('region必须是字符串')
        ];
    }
}

module.exports = AiAgentInstanceDescribeRequestDto;