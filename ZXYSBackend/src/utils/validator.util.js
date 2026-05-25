// utils/validator.util.js
const Joi = require('joi');
const BizException = require('../exceptions/biz.exception');

/**
 * 验证器工具类
 * 对应Java的ValidatorUtils
 */
class ValidatorUtils {
    /**
     * 验证对象
     * @param {Object} object - 要验证的对象
     * @param {Joi.Schema} schema - Joi验证模式
     * @param {Object} options - 验证选项
     * @throws {BizException} 验证失败时抛出业务异常
     */
    static validate(object, schema, options = {}) {
        const { error, value } = schema.validate(object, {
            abortEarly: false, // 返回所有错误
            stripUnknown: true, // 移除未定义的字段
            ...options
        });

        if (error) {
            // 构建错误消息（对应Java的msg.append）
            const errorMessages = error.details.map(detail => {
                // 格式化字段路径，例如：将"user.name"转换为"用户名称"
                const field = this.formatFieldName(detail.path.join('.'));
                return `${field}${detail.message.replace(/^".*?"\s*/, ' ')}`;
            });

            // 使用<br>分隔多个错误消息（保持与Java一致）
            const msg = errorMessages.join('<br>');
            
            // 抛出业务异常
            throw new BizException(msg, 400);
        }

        return value;
    }

    /**
     * 验证实体（对应validateEntity）
     * @param {Object} object - 要验证的对象
     * @param {Joi.Schema} schema - Joi验证模式
     * @param {Array|string} groups - 验证组（对应groups参数）
     * @throws {BizException} 验证失败时抛出业务异常
     */
    static validateEntity(object, schema, groups = []) {
        // 处理验证组（Java的groups参数）
        let validationSchema = schema;
        
        if (groups && groups.length > 0) {
            // 如果有验证组，可以选择特定的验证规则
            // 这里需要根据你的业务逻辑来实现
            validationSchema = this.getSchemaForGroups(schema, groups);
        }

        return this.validate(object, validationSchema);
    }

    /**
     * 格式化字段名称（将驼峰转换为中文）
     * @param {string} fieldName - 字段名
     * @returns {string} 格式化后的字段名
     */
    static formatFieldName(fieldName) {
        const fieldMap = {
            'userId': '用户ID',
            'user_id': '用户ID',
            'username': '用户名',
            'password': '密码',
            'email': '邮箱',
            'phone': '手机号',
            'age': '年龄',
            'aiAgentId': 'AI代理ID',
            'ai_agent_id': 'AI代理ID',
            'aiAgentInstanceId': 'AI代理实例ID',
            'ai_agent_instance_id': 'AI代理实例ID',
            'channelId': '频道ID',
            'channel_id': '频道ID'
        };

        return fieldMap[fieldName] || fieldName;
    }

    /**
     * 根据验证组获取对应的schema
     * @param {Joi.Schema} schema - 原始schema
     * @param {Array|string} groups - 验证组
     * @returns {Joi.Schema} 对应的schema
     */
    static getSchemaForGroups(schema, groups) {
        // 这里实现根据groups选择不同验证规则的逻辑
        // 例如：groups包含'create'时，所有字段必填
        // groups包含'update'时，部分字段可选
        
        // 这是一个示例实现，你需要根据实际需求调整
        if (groups.includes('create')) {
            return schema.required();
        } else if (groups.includes('update')) {
            return schema.optional();
        }
        
        return schema;
    }

    /**
     * 创建验证器实例（对应静态初始化块）
     */
    static createValidator() {
        // 返回Joi实例，类似Java的Validation.buildDefaultValidatorFactory().getValidator()
        return Joi;
    }
}

// 静态初始化（对应Java的static块）
ValidatorUtils.validator = ValidatorUtils.createValidator();

module.exports = ValidatorUtils;