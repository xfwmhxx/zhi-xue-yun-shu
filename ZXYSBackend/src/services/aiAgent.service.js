// services/aiAgent.service.js
const Core = require('@alicloud/pop-core');
const logger = require('../utils/logger');
const BizException = require('../exceptions/biz.exception');
const GenerateMessageChatTokenResponse = require('../dtos/responses/generateMessageChatToken.response');
const AiAgentInstanceDescribeResponse = require('../dtos/responses/aiAgentInstanceDescribe.response');

/**
 * AI代理服务类
 * 对应Java的AiAgentServiceImpl
 */
class AiAgentService {
    constructor() {
        this.clients = new Map();
        this.accessKeyId = process.env.OPENAPI_ACCESS_KEY;
        this.accessKeySecret = process.env.OPENAPI_ACCESS_SECRET;
    }

    /**
     * 获取指定区域的客户端
     */
    getClient(region) {
        if (this.clients.has(region)) {
            return this.clients.get(region);
        }
        const client = this.createClient(region);
        this.clients.set(region, client);
        return client;
    }

    /**
     * 创建客户端
     */
    createClient(region) {
        try {
            const client = new Core({
                accessKeyId: this.accessKeyId,
                accessKeySecret: this.accessKeySecret,
                endpoint: `https://ice.${region}.aliyuncs.com`,
                apiVersion: '2020-11-09'
            });
            logger.info(`Created client for region: ${region}`);
            return client;
        } catch (error) {
            logger.error(`Create client error for region ${region}:`, error);
            throw new BizException(`创建阿里云客户端失败: ${error.message}`, 500);
        }
    }

    /**
     * 生成消息聊天令牌（对应Java的generateMessageChatToken方法）
     */
    async generateMessageChatToken(aiAgentId, role, userId, expire, region) {
        const action = 'GenerateMessageChatToken';
        const startTime = Date.now();
        let requestId = '';
        let message = '';
        let errCode = '';
        let code = 500;

        try {
            const params = {
                'AIAgentId': aiAgentId,
                'Role': role || 'user',
                'UserId': userId,
                'Expire': expire || 3600,
                'RegionId': region || 'cn-shanghai'
            };

            const client = this.getClient(region || 'cn-shanghai');

            logger.info(`generateMessageChatToken request:`, { action, params, region });

            const response = await client.request(action, params, { method: 'POST' });

            logger.info(`generateMessageChatToken response:`, {
                response,
                cost: `${Date.now() - startTime}ms`
            });

            if (response && response.StatusCode === 200) {
                const body = response.Body || response;
                
                const appId = body.AppId || body.appId;
                const token = body.Token || body.token;
                const userIdResponse = body.UserId || body.userId;
                const nonce = body.Nonce || body.nonce;
                const roleResponse = body.Role || body.role;
                const timestamp = body.TimeStamp || body.timestamp || Date.now();
                const appSign = body.AppSign || body.appSign;
                requestId = body.RequestId || body.requestId;

                return GenerateMessageChatTokenResponse.builder()
                    .appId(appId)
                    .token(token)
                    .userId(userIdResponse)
                    .nonce(nonce)
                    .role(roleResponse)
                    .timestamp(timestamp)
                    .appSign(appSign)
                    .code(200)
                    .message('success')
                    .requestId(requestId)
                    .build();
            }

            message = response?.Message || '未知错误';
            code = response?.StatusCode || 500;
            requestId = response?.RequestId || '';

        } catch (error) {
            return this.handleApiError(error, action, region, startTime);
        }

        return GenerateMessageChatTokenResponse.builder()
            .code(code)
            .message(message)
            .requestId(requestId)
            .errorCode(errCode)
            .build();
    }

    /**
     * 描述AI代理实例（对应Java的describeAiAgentInstance方法）
     * 调用阿里云 DescribeAIAgentInstance API 查询已存在的实例
     */
// services/aiAgent.service.js

async describeAiAgentInstance(aiAgentInstanceId, region) {
    try {
        logger.info('AiAgentService.describeAiAgentInstance called:', { aiAgentInstanceId, region });
        
        // ✅ 使用正确的 API 名称
        const action = 'DescribeAIAgentInstance';
        const params = {
            InstanceId: aiAgentInstanceId,      // 智能体实例 ID
            RegionId: region || 'cn-shanghai'
        };

        const client = this.getClient(region);
        const response = await client.request(action, params, { method: 'POST' });
        
        logger.info('describeAiAgentInstance response:', response);
        
        // 根据官方文档处理响应
        if (response && response.RequestId) {
            const instance = response.Instance || {};
            return {
                code: 200,
                message: 'success',
                request_id: response.RequestId,
                call_log_url: instance.CallLogUrl || '',        // 通话记录 URL
                runtime_config: JSON.stringify(instance.RuntimeConfig || {}),
                status: instance.Status || '',                   // 实例状态
                template_config: JSON.stringify(instance.TemplateConfig || {}),
                user_data: instance.UserData || ''
            };
        } else {
            return {
                code: 500,
                message: response?.Message || '未知错误',
                request_id: response?.RequestId || '',
                error_code: response?.Code || 'UnknownError'
            };
        }
    } catch (error) {
        logger.error('Error in describeAiAgentInstance:', error);
        
        // 处理实例不存在的错误
        if (error.code === 'InstanceIdNotExist') {
            logger.warn(`Instance ${aiAgentInstanceId} does not exist`);
        }
        
        return {
            code: error.statusCode || 500,
            message: error.message || '未知错误',
            request_id: error.requestId || '',
            error_code: error.code || 'UnknownError'
        };
    }
}

    /**
     * 生成AI智能体实例
     * 对应Java：这个方法不存在，直接返回成功，使用前端传入的 agentId
     * 不调用阿里云 API 创建新实例
     */
// services/aiAgent.service.js

async generateAIAgentCall(params) {
    const startTime = Date.now();
    
    const {
        user_id,
        ai_agent_id,
        expire = 3600,
        region = 'cn-hangzhou',
        session_id,
        agent_config,
        user_data
    } = params;

    try {
        logger.info('generateAIAgentCall request:', {
            user_id,
            ai_agent_id,
            region
        });

        // ✅ 使用正确的 API 名称：GenerateAIAgentCall
        const action = 'GenerateAIAgentCall';
        
        // 构建请求参数（根据官方文档）
        const requestParams = {
            'AIAgentId': ai_agent_id,      // 必填：智能体 ID
            'Expire': expire,               // 可选：token 过期时间，默认 3600 秒
            'RegionId': region
        };
        
        // 可选参数
        if (user_id) {
            requestParams['UserId'] = user_id;  // 频道内用户名称
        }
        if (session_id) {
            requestParams['SessionId'] = session_id;  // 对话唯一标记
        }
        if (agent_config) {
            requestParams['AgentConfig'] = agent_config;
        }
        if (user_data) {
            requestParams['UserData'] = user_data;
        }

        // 获取阿里云客户端
        const client = this.getClient(region);
        
        // 调用阿里云 API
        const response = await client.request(action, requestParams, { method: 'POST' });

        logger.info('generateAIAgentCall response:', {
            response,
            cost: `${Date.now() - startTime}ms`
        });

        // 处理成功响应（根据官方文档返回格式）
        if (response && response.RequestId) {
            return {
                code: 200,
                ai_agent_instance_id: response.InstanceId,      // 实例 ID
                channel_id: response.ChannelId,                 // ARTC 频道 ID
                ai_agent_user_id: response.AIAgentUserId,       // 智能体在频道内的名称
                rtc_auth_token: response.Token,                 // ARTC Token
                request_id: response.RequestId,
                user_id: response.UserId                        // 用户在频道内的名称
            };
        }

        // 处理错误响应
        return {
            code: response?.StatusCode || 500,
            message: response?.Message || '生成AI代理实例失败',
            request_id: response?.RequestId || '',
            error_code: response?.Code || 'UnknownError'
        };

    } catch (error) {
        logger.error('generateAIAgentCall error:', error);
        
        // 处理特定错误码
        if (error.code === 'InvalidAction.NotFound') {
            logger.error('API Action not found. Please use GenerateAIAgentCall instead of CreateAIAgentInstance.');
        }
        
        return {
            code: error.statusCode || 500,
            message: error.message || '生成AI代理实例失败',
            request_id: error.requestId || '',
            error_code: error.code || 'UnknownError'
        };
    }
}

    /**
     * 获取RTC认证令牌
     */
    async getRtcAuthToken(userId, channelId) {
        try {
            logger.info('AiAgentService.getRtcAuthToken called:', { userId, channelId });
            
            // 返回模拟的 RTC token
            return {
                auth_token: `rtc_token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`,
                timestamp: Date.now(),
                channel_id: channelId
            };
        } catch (error) {
            logger.error('getRtcAuthToken error:', error);
            throw error;
        }
    }

    /**
     * 处理API错误
     */
    handleApiError(error, action, region, startTime) {
        const cost = Date.now() - startTime;
        let requestId = '';
        let message = error.message;
        let code = 500;
        let errCode = '';

        logger.error(`${action} error:`, {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            region,
            cost: `${cost}ms`
        });

        if (error.name === 'TeaException' || error.code) {
            requestId = error.data?.RequestId || error.requestId || '';
            message = error.message;
            code = error.statusCode || error.code || 500;
            errCode = error.code || 'UnknownError';
            
            logger.error(`${action} Tea error:`, { requestId, code, errCode, message });
        } else if (error.name === 'TypeError' || error.message.includes('null')) {
            logger.error(`${action} NullPointer error:`, { region, message: error.message });
        }

        return { requestId, message, code, errCode };
    }

    /**
     * 批量生成聊天令牌
     */
    async batchGenerateMessageChatToken(requests) {
        const promises = requests.map(req => 
            this.generateMessageChatToken(
                req.aiAgentId,
                req.role,
                req.userId,
                req.expire,
                req.region
            ).catch(error => error)
        );
        return Promise.all(promises);
    }

    /**
     * 批量描述AI代理实例
     */
    async batchDescribeAiAgentInstances(instanceIds, region) {
        const promises = instanceIds.map(instanceId =>
            this.describeAiAgentInstance(instanceId, region).catch(error => error)
        );
        return Promise.all(promises);
    }
}

module.exports = new AiAgentService();