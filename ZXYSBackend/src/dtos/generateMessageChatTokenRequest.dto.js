// dtos/generateMessageChatTokenRequest.dto.js
const { body } = require('express-validator');

/**
 * GenerateMessageChatTokenRequest DTO
 * 对应Java的GenerateMessageChatTokenRequestDto
 */
class GenerateMessageChatTokenRequestDto {
    constructor(data = {}) {
        // 支持两种命名风格（蛇形和驼峰）
        this.ai_agent_id = data.ai_agent_id || data.aiAgentId || '';
        this.user_id = data.user_id || data.userId || '';
        this.role = data.role || '';
        this.expire = data.expire || 3600; // 默认过期时间1小时
        this.region = data.region || '';
    }

    /**
     * 从请求体创建DTO实例
     * @param {Object} body - 请求体
     * @returns {GenerateMessageChatTokenRequestDto}
     */
    static fromRequest(body) {
        const dto = new GenerateMessageChatTokenRequestDto();
        
        dto.ai_agent_id = body.ai_agent_id || body.aiAgentId || '';
        dto.user_id = body.user_id || body.userId || '';
        dto.role = body.role || '';
        dto.expire = body.expire || body.expireTime || 3600;
        dto.region = body.region || 'cn-shanghai'; // 默认region
        
        return dto;
    }

    /**
     * 转换为API请求格式（蛇形命名）
     * @returns {Object}
     */
    toJSON() {
        return {
            ai_agent_id: this.ai_agent_id,
            user_id: this.user_id,
            role: this.role,
            expire: this.expire,
            region: this.region
        };
    }

    /**
     * 转换为服务层使用的格式（驼峰命名）
     * @returns {Object}
     */
    toService() {
        return {
            aiAgentId: this.ai_agent_id,
            userId: this.user_id,
            role: this.role,
            expire: this.expire,
            region: this.region
        };
    }

    /**
     * 验证规则（对应@NotBlank）
     */
    static validators() {
        return [
            body('ai_agent_id')
                .notEmpty().withMessage('AI代理ID不能为空')
                .isString().withMessage('AI代理ID必须是字符串')
                .trim(),
            
            body('user_id')
                .notEmpty().withMessage('用户ID不能为空')
                .isString().withMessage('用户ID必须是字符串')
                .trim(),
            
            body('role')
                .optional()
                .isString().withMessage('角色必须是字符串')
                .isIn(['user', 'assistant', 'system']).withMessage('角色必须是user、assistant或system'),
            
            body('expire')
                .optional()
                .isInt({ min: 60, max: 86400 }).withMessage('过期时间必须在60-86400秒之间')
                .toInt(), // 转换为整数
            
            body('region')
                .optional()
                .isString().withMessage('区域必须是字符串')
                .isIn(['cn-shanghai', 'cn-beijing', 'cn-hangzhou']).withMessage('区域不支持')
        ];
    }

    /**
     * 验证并创建DTO（静态工厂方法）
     */
    static create(data) {
        const dto = new GenerateMessageChatTokenRequestDto(data);
        
        // 手动验证（另一种方式）
        const errors = [];
        
        if (!dto.ai_agent_id) {
            errors.push({ field: 'ai_agent_id', message: 'AI代理ID不能为空' });
        }
        
        if (!dto.user_id) {
            errors.push({ field: 'user_id', message: '用户ID不能为空' });
        }
        
        if (dto.expire && (dto.expire < 60 || dto.expire > 86400)) {
            errors.push({ field: 'expire', message: '过期时间必须在60-86400秒之间' });
        }
        
        if (errors.length > 0) {
            const error = new Error('参数验证失败');
            error.code = 400;
            error.errors = errors;
            throw error;
        }
        
        return dto;
    }
}

module.exports = GenerateMessageChatTokenRequestDto;