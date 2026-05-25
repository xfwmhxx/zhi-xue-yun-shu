// controllers/aiAgent.controller.js
const { Result } = require('../utils/result.util');
const { ValidatorUtils } = require('../utils/validator.util');
const imsService = require('../services/interface/ims.service.impl');
const aiAgentService = require('../services/aiAgent.service'); 
const logger = require('../utils/logger');
const BizException = require('../exceptions/biz.exception');

// DTO导入
const GenerateMessageChatTokenRequestDto = require('../dtos/generateMessageChatTokenRequest.dto');
const RtcAuthTokenRequestDto = require('../dtos/rtcAuthTokenRequest.dto');
const AiAgentInstanceDescribeRequestDto = require('../dtos/aiAgentInstanceDescribeRequest.dto');
const GenerateAIAgentCallRequestDto = require('../dtos/generateAIAgentCallRequest.dto');

// ==================== 日志工具函数 ====================
const logWithTimestamp = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [AIAgentController]`;
    
    switch (level) {
        case 'info':
            console.log(`${prefix} ℹ️ ${message}`);
            if (data) console.log(`${prefix} 📦 数据:`, data);
            break;
        case 'warn':
            console.warn(`${prefix} ⚠️ ${message}`);
            if (data) console.warn(`${prefix} 📦 数据:`, data);
            break;
        case 'error':
            console.error(`${prefix} ❌ ${message}`);
            if (data) console.error(`${prefix} 📦 数据:`, data);
            break;
        case 'debug':
            console.debug(`${prefix} 🔍 ${message}`);
            if (data) console.debug(`${prefix} 📦 数据:`, data);
            break;
        default:
            console.log(`${prefix} ${message}`);
            if (data) console.log(data);
    }
};

/**
 * AI代理控制器V2
 * 对应Java的AIAgentControllerV2
 */
class AIAgentControllerV2 {
    constructor() {
        // 注入服务（对应@Resource）
        this.imsService = new imsService(aiAgentService);
        logWithTimestamp('info', 'AI代理控制器V2初始化完成');
    }

    /**
     * 生成消息聊天令牌
     * 对应Java的generateMessageChatToken方法
     */
    async generateMessageChatToken(req, res, next) {
        const startTime = Date.now();
        logWithTimestamp('info', '========== 开始生成消息聊天令牌 ==========');
        
        try {
            // 从请求体创建DTO
            const dto = GenerateMessageChatTokenRequestDto.fromRequest(req.body);
            
            logWithTimestamp('debug', '请求参数', {
                aiAgentId: dto.ai_agent_id,
                userId: dto.user_id,
                role: dto.role,
                expire: dto.expire,
                region: dto.region
            });
            
            // 验证DTO（对应ValidatorUtils.validateEntity）
            await this.validateDto(dto, GenerateMessageChatTokenRequestDto.validators);
            
            // 记录请求日志（对应@Slf4j）
            logger.info('generateMessageChatToken request:', {
                aiAgentId: dto.ai_agent_id,
                userId: dto.user_id,
                role: dto.role,
                expire: dto.expire,
                region: dto.region
            });
            
            logWithTimestamp('info', '调用服务 generateMessageChatToken...');

            // 调用服务（对应imsService.generateMessageChatToken）
            const response = await this.imsService.generateMessageChatToken(dto);
            
            const duration = Date.now() - startTime;
            logWithTimestamp('info', `服务响应完成，耗时: ${duration}ms`);

            // 处理响应
            if (!response) {
                logWithTimestamp('warn', '服务返回空响应');
                return res.json(Result.error());
            }

            if (response.code === 200) {
                logWithTimestamp('info', '✅ 生成聊天令牌成功', { requestId: response.request_id || response.requestId });
                
                // 构建成功响应（对应Java的map.put）
                const result = Result.ok()
                    .put('app_id', response.app_id || response.appId)
                    .put('token', response.token)
                    .put('user_id', response.user_id || response.userId)
                    .put('nonce', response.nonce)
                    .put('role', response.role)
                    .put('timestamp', response.timestamp)
                    .put('app_sign', response.app_sign || response.appSign)
                    .put('request_id', response.request_id || response.requestId)
                    .put('message', response.message || 'success');

                res.json(result.toJSON());
            } else {
                logWithTimestamp('error', '生成聊天令牌失败', {
                    code: response.code,
                    message: response.message,
                    errorCode: response.error_code || response.errorCode
                });
                
                // 错误响应（对应getErrorResult）
                const errorResult = this.getErrorResult(
                    response.error_code || response.errorCode,
                    response.request_id || response.requestId,
                    response.code,
                    response.message
                );
                res.json(errorResult);
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            logWithTimestamp('error', `生成聊天令牌失败，耗时: ${duration}ms`, {
                message: error.message,
                stack: error.stack
            });
            // 统一错误处理
            next(error);
        }
        
        logWithTimestamp('info', '========== 生成消息聊天令牌结束 ==========');
    }

    /**
     * 获取RTC认证令牌
     * 对应Java的getRtcAuthToken方法
     */
    async getRtcAuthToken(req, res, next) {
        const startTime = Date.now();
        logWithTimestamp('info', '========== 开始获取RTC认证令牌 ==========');
        
        try {
            // 从请求体创建DTO
            const dto = RtcAuthTokenRequestDto.fromRequest(req.body);
            
            logWithTimestamp('debug', '请求参数', {
                channelId: dto.channel_id,
                userId: dto.user_id
            });
            
            // 验证DTO
            await this.validateDto(dto, RtcAuthTokenRequestDto.validators);
            
            // 记录请求日志
            logger.info('getRtcAuthToken request:', {
                channelId: dto.channel_id,
                userId: dto.user_id
            });
            
            logWithTimestamp('info', '调用服务 getRtcAuthToken...');

            // 调用服务
            const response = this.imsService.getRtcAuthToken(dto);
            
            const duration = Date.now() - startTime;
            logWithTimestamp('info', `服务响应完成，耗时: ${duration}ms`);

            // 构建响应
            const result = Result.ok()
                .put('rtc_auth_token', response.auth_token || response.authToken)
                .put('timestamp', response.timestamp)
                .put('channel_id', dto.channel_id || dto.channelId);

            logWithTimestamp('info', '✅ 获取RTC认证令牌成功');
            res.json(result.toJSON());
        } catch (error) {
            const duration = Date.now() - startTime;
            logWithTimestamp('error', `获取RTC认证令牌失败，耗时: ${duration}ms`, {
                message: error.message,
                stack: error.stack
            });
            next(error);
        }
        
        logWithTimestamp('info', '========== 获取RTC认证令牌结束 ==========');
    }

    /**
     * 描述AI代理实例
     * 对应Java的describeAIAgentInstance方法
     */
    async describeAIAgentInstance(req, res, next) {
        const startTime = Date.now();
        logWithTimestamp('info', '========== 开始查询AI代理实例 ==========');
        
        try {
            // 从请求体创建DTO
            const dto = AiAgentInstanceDescribeRequestDto.fromRequest(req.body);
            
            logWithTimestamp('debug', '请求参数', {
                instanceId: dto.ai_agent_instance_id,
                region: dto.region
            });
            
            // 验证DTO
            await this.validateDto(dto, AiAgentInstanceDescribeRequestDto.validators);
            
            // 记录请求日志
            logger.info('describeAIAgentInstance request:', {
                instanceId: dto.ai_agent_instance_id,
                region: dto.region
            });
            
            logWithTimestamp('info', '调用服务 describeAiAgentInstance...');

            // 调用服务
            const response = await this.imsService.describeAiAgentInstance(dto);
            
            const duration = Date.now() - startTime;
            logWithTimestamp('info', `服务响应完成，耗时: ${duration}ms`);

            // 处理响应
            if (!response) {
                logWithTimestamp('warn', '服务返回空响应');
                return res.json(Result.error());
            }

            if (response.code === 200) {
                logWithTimestamp('info', '✅ 查询AI代理实例成功', {
                    status: response.status,
                    requestId: response.request_id || response.requestId
                });
                
                // 构建成功响应
                const result = Result.ok()
                    .put('code', response.code)
                    .put('message', response.message)
                    .put('request_id', response.request_id || response.requestId)
                    .put('call_log_url', response.call_log_url || response.callLogUrl)
                    .put('runtime_config', response.runtime_config || response.runtimeConfig)
                    .put('status', response.status)
                    .put('template_config', response.template_config || response.templateConfig)
                    .put('user_data', response.user_data || response.userData);

                res.json(result.toJSON());
            } else {
                logWithTimestamp('error', '查询AI代理实例失败', {
                    code: response.code,
                    message: response.message
                });
                
                // 错误响应
                const errorResult = this.getErrorResult(
                    response.error_code || response.errorCode,
                    response.request_id || response.requestId,
                    response.code,
                    response.message
                );
                res.json(errorResult);
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            logWithTimestamp('error', `查询AI代理实例失败，耗时: ${duration}ms`, {
                message: error.message,
                stack: error.stack
            });
            next(error);
        }
        
        logWithTimestamp('info', '========== 查询AI代理实例结束 ==========');
    }

    /**
     * 生成AI智能体实例
     * 对应前端 standard.ts 中的 generateAIAgent 方法
     * POST /api/v2/aiagent/generateAIAgentCall
     */
    async generateAIAgentCall(req, res, next) {
        const startTime = Date.now();
        logWithTimestamp('info', '========== 开始生成AI智能体实例 ==========');
        
        try {
            // 从请求体创建DTO
            const dto = GenerateAIAgentCallRequestDto.fromRequest(req.body);
            
            logWithTimestamp('debug', '请求参数', {
                userId: dto.user_id,
                agentId: dto.ai_agent_id,
                workflowType: dto.workflow_type,
                region: dto.region,
                sessionId: dto.session_id
            });
            
            // 验证DTO
            await this.validateGenerateAIAgentCallDto(dto);
            
            // 记录请求日志
            logger.info('generateAIAgentCall request:', {
                userId: dto.user_id,
                agentId: dto.ai_agent_id,
                workflowType: dto.workflow_type,
                region: dto.region,
                sessionId: dto.session_id
            });
            
            logWithTimestamp('info', '调用服务 generateAIAgentCall...');

            // 调用服务层（需要添加对应的方法）
            const response = await this.imsService.generateAIAgentCall(dto);
            
            const duration = Date.now() - startTime;
            logWithTimestamp('info', `服务响应完成，耗时: ${duration}ms`);

            // 处理响应
            if (!response) {
                logWithTimestamp('warn', '服务返回空响应');
                return res.json(Result.error());
            }

            if (response.code === 200) {
                logWithTimestamp('info', '✅ 生成AI智能体实例成功', {
                    instanceId: response.ai_agent_instance_id || response.instanceId,
                    channelId: response.channel_id || response.channelId,
                    requestId: response.request_id || response.requestId
                });
                
                // 构建成功响应 - 格式必须匹配前端期望
                const result = Result.ok()
                    .put('code', response.code)
                    .put('ai_agent_instance_id', response.ai_agent_instance_id || response.instanceId)
                    .put('channel_id', response.channel_id || response.channelId)
                    .put('ai_agent_user_id', response.ai_agent_user_id || response.userId)
                    .put('rtc_auth_token', response.rtc_auth_token || response.rtcAuthToken)
                    .put('request_id', response.request_id || response.requestId);

                res.json(result.toJSON());
            } else {
                logWithTimestamp('error', '生成AI智能体实例失败', {
                    code: response.code,
                    message: response.message,
                    errorCode: response.error_code || response.errorCode
                });
                
                // 错误响应
                const errorResult = this.getErrorResult(
                    response.error_code || response.errorCode,
                    response.request_id || response.requestId,
                    response.code,
                    response.message || '生成AI代理实例失败'
                );
                res.json(errorResult);
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            logWithTimestamp('error', `生成AI智能体实例失败，耗时: ${duration}ms`, {
                message: error.message,
                stack: error.stack
            });
            next(error);
        }
        
        logWithTimestamp('info', '========== 生成AI智能体实例结束 ==========');
    }

    /**
     * 验证 generateAIAgentCall DTO
     * @private
     */
    async validateGenerateAIAgentCallDto(dto) {
        const errors = [];
        
        if (!dto.user_id) {
            errors.push('用户ID不能为空');
            logWithTimestamp('warn', '验证失败: 用户ID为空');
        }
        
        // 如果没有 ai_agent_id，则必须有 workflow_type
        if (!dto.ai_agent_id && dto.workflow_type === undefined) {
            errors.push('AI代理ID或工作流类型至少需要一个');
            logWithTimestamp('warn', '验证失败: AI代理ID和工作流类型都为空');
        }
        
        if (errors.length > 0) {
            logWithTimestamp('error', 'DTO验证失败', { errors });
            throw new BizException(errors.join('<br>'), 400);
        }
        
        logWithTimestamp('debug', 'DTO验证通过');
    }

    /**
     * 获取错误结果
     * 对应Java的getErrorResult方法
     * @private
     */
    getErrorResult(errCode, requestId, code, message) {
        logWithTimestamp('debug', '构建错误结果', { errCode, requestId, code, message });
        
        const result = Result.error(code, message);
        const map = {
            error_code: errCode,
            request_id: requestId
        };
        
        // 添加额外字段
        Object.entries(map).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                result.put(key, value);
            }
        });
        
        return result.toJSON();
    }

    /**
     * 验证DTO
     * @private
     */
    async validateDto(dto, validators) {
        if (validators) {
            // 这里可以使用express-validator或其他验证库
            // 简单示例：手动检查必填字段
            const errors = [];
            
            if (dto instanceof GenerateMessageChatTokenRequestDto) {
                if (!dto.ai_agent_id) errors.push('AI代理ID不能为空');
                if (!dto.user_id) errors.push('用户ID不能为空');
            } else if (dto instanceof AiAgentInstanceDescribeRequestDto) {
                if (!dto.ai_agent_instance_id) errors.push('AI代理实例ID不能为空');
            }
            
            if (errors.length > 0) {
                logWithTimestamp('error', 'DTO验证失败', { errors, dtoType: dto.constructor.name });
                throw new BizException(errors.join('<br>'), 400);
            }
        }
        
        logWithTimestamp('debug', 'DTO验证通过', { dtoType: dto.constructor.name });
    }

    /**
     * 批量生成聊天令牌
     * 额外添加的批量接口
     */
    async batchGenerateMessageChatToken(req, res, next) {
        const startTime = Date.now();
        logWithTimestamp('info', '========== 开始批量生成聊天令牌 ==========');
        
        try {
            const { requests } = req.body;
            
            logWithTimestamp('debug', '批量请求参数', { requestCount: requests?.length });
            
            if (!Array.isArray(requests)) {
                logWithTimestamp('error', '请求参数格式错误: requests必须是数组');
                throw new BizException('requests必须是数组', 400);
            }

            const results = await Promise.all(
                requests.map(async (requestData, index) => {
                    const dto = GenerateMessageChatTokenRequestDto.fromRequest(requestData);
                    try {
                        const response = await this.imsService.generateMessageChatToken(dto);
                        logWithTimestamp('debug', `第${index + 1}个请求成功`);
                        return {
                            success: true,
                            data: response
                        };
                    } catch (error) {
                        logWithTimestamp('warn', `第${index + 1}个请求失败`, { error: error.message });
                        return {
                            success: false,
                            error: error.message
                        };
                    }
                })
            );

            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;
            
            const duration = Date.now() - startTime;
            logWithTimestamp('info', `批量生成完成，成功: ${successCount}，失败: ${failCount}，耗时: ${duration}ms`);

            res.json(Result.ok().put('data', results).toJSON());
        } catch (error) {
            const duration = Date.now() - startTime;
            logWithTimestamp('error', `批量生成聊天令牌失败，耗时: ${duration}ms`, {
                message: error.message,
                stack: error.stack
            });
            next(error);
        }
        
        logWithTimestamp('info', '========== 批量生成聊天令牌结束 ==========');
    }
}

module.exports = new AIAgentControllerV2();