// dtos/rtcAuthTokenRequest.dto.js
const { body } = require('express-validator');  // 需要添加这行

/**
 * RTC认证令牌请求DTO
 * 对应Java的RtcAuthTokenRequestDto
 */
class RtcAuthTokenRequestDto {
    constructor(data = {}) {
        // 支持两种命名风格（蛇形和驼峰）
        this.channel_id = data.channel_id || data.channelId || '';
        this.user_id = data.user_id || data.userId || '';
    }

    /**
     * 从请求体创建DTO实例
     * @param {Object} body - 请求体
     * @returns {RtcAuthTokenRequestDto}
     */
    static fromRequest(body) {
        const dto = new RtcAuthTokenRequestDto();
        
        dto.channel_id = body.channel_id || body.channelId || '';
        dto.user_id = body.user_id || body.userId || '';
        
        return dto;
    }

    /**
     * 验证规则
     * 对应Java的@NotBlank等注解
     * @returns {Array} express-validator验证规则数组
     */
    static validators() {
        return [
            body('channel_id')
                .optional()  // 可选字段
                .isString().withMessage('频道ID必须是字符串')
                .trim()
                .isLength({ min: 1, max: 64 }).withMessage('频道ID长度必须在1-64之间')
                .matches(/^[a-zA-Z0-9_-]+$/).withMessage('频道ID只能包含字母、数字、下划线和连字符'),
            
            body('user_id')
                .optional()  // 可选字段
                .isString().withMessage('用户ID必须是字符串')
                .trim()
                .isLength({ min: 1, max: 64 }).withMessage('用户ID长度必须在1-64之间')
                .matches(/^[a-zA-Z0-9_-]+$/).withMessage('用户ID只能包含字母、数字、下划线和连字符')
        ];
    }

    /**
     * 验证规则 - 至少需要一个参数
     * 如果需要至少一个字段不为空，可以使用这个验证器
     */
    static validatorsWithRequirement() {
        return [
            body('channel_id')
                .optional()
                .isString().withMessage('频道ID必须是字符串'),
            
            body('user_id')
                .optional()
                .isString().withMessage('用户ID必须是字符串'),
            
            // 自定义验证：至少需要一个字段
            body().custom((value, { req }) => {
                if (!req.body.channel_id && !req.body.user_id && !req.body.channelId && !req.body.userId) {
                    throw new Error('至少需要提供channel_id或user_id其中一个');
                }
                return true;
            })
        ];
    }

    /**
     * 简单的验证规则（如果不需要复杂验证）
     */
    static simpleValidators() {
        return [
            body('channel_id')
                .optional()
                .isString().withMessage('频道ID必须是字符串'),
            
            body('user_id')
                .optional()
                .isString().withMessage('用户ID必须是字符串')
        ];
    }

    /**
     * 转换为API请求格式（蛇形命名）
     * @returns {Object}
     */
    toJSON() {
        return {
            channel_id: this.channel_id,
            user_id: this.user_id
        };
    }

    /**
     * 转换为服务层使用的格式（驼峰命名）
     * @returns {Object}
     */
    toService() {
        return {
            channelId: this.channel_id || undefined,
            userId: this.user_id || undefined
        };
    }

    /**
     * 检查是否包含必要信息
     * @returns {boolean}
     */
    isValid() {
        // 至少需要一个参数，或者两个都有
        return !!(this.channel_id || this.user_id);
    }

    /**
     * 获取非空字段
     * @returns {Object}
     */
    getNonEmptyFields() {
        const fields = {};
        if (this.channel_id) fields.channelId = this.channel_id;
        if (this.user_id) fields.userId = this.user_id;
        return fields;
    }
}

module.exports = RtcAuthTokenRequestDto;