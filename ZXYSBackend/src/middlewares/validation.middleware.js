// src/middlewares/validation.middleware.js
const { validationResult } = require('express-validator');
const BizException = require('../exceptions/biz.exception');

/**
 * 验证请求中间件
 * 对应Java的ValidatorUtils.validateEntity
 */
const validateRequest = (validations) => {
    return async (req, res, next) => {
        try {
            // 如果没有验证规则，直接通过
            if (!validations) {
                return next();
            }
            
            // 获取验证规则数组
            let validationRules = validations;
            
            // 如果是函数，调用它获取验证规则
            if (typeof validationRules === 'function') {
                validationRules = validationRules();
            }
            
            // 如果是对象但不是数组，转换为数组
            if (validationRules && !Array.isArray(validationRules)) {
                // 如果是普通对象，提取其值作为数组
                if (typeof validationRules === 'object' && validationRules !== null) {
                    validationRules = Object.values(validationRules);
                } else {
                    validationRules = [validationRules];
                }
            }
            
            // 确保是数组后再执行验证
            if (Array.isArray(validationRules) && validationRules.length > 0) {
                await Promise.all(validationRules.map(validation => validation.run(req)));
            }
            
            const errors = validationResult(req);
            if (errors.isEmpty()) {
                return next();
            }

            // 构建错误消息
            const errorMessages = errors.array().map(error => {
                return error.msg;
            });

            const msg = errorMessages.join('<br>');
            
            // 抛出业务异常
            next(new BizException(msg, 400));
        } catch (error) {
            next(error);
        }
    };
};

/**
 * 验证请求体中间件（使用Joi）
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            if (!schema) {
                return next();
            }
            
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errorMessages = error.details.map(detail => detail.message);
                const msg = errorMessages.join('<br>');
                return next(new BizException(msg, 400));
            }

            req.validatedBody = value;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * 验证查询参数中间件
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            if (!schema) {
                return next();
            }
            
            const { error, value } = schema.validate(req.query, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errorMessages = error.details.map(detail => detail.message);
                const msg = errorMessages.join('<br>');
                return next(new BizException(msg, 400));
            }

            req.validatedQuery = value;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * 验证路径参数中间件
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            if (!schema) {
                return next();
            }
            
            const { error, value } = schema.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errorMessages = error.details.map(detail => detail.message);
                const msg = errorMessages.join('<br>');
                return next(new BizException(msg, 400));
            }

            req.validatedParams = value;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    validateRequest,
    validateBody,
    validateQuery,
    validateParams
};