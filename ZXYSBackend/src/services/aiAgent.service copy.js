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

    getClient(region) {
        if (this.clients.has(region)) {
            return this.clients.get(region);
        }
        const client = this.createClient(region);
        this.clients.set(region, client);
        return client;
    }

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

    async describeAiAgentInstance(aiAgentInstanceId, region) {
        try {
            logger.info('AiAgentService.describeAiAgentInstance called', { aiAgentInstanceId, region });
            
            const action = 'DescribeAIAgentInstance';
            const params = {
                InstanceId: aiAgentInstanceId,
                RegionId: region || 'cn-shanghai'
            };

            const client = this.getClient(region);
            const response = await client.request(action, params, { method: 'POST' });
            
            logger.info('describeAiAgentInstance response:', response);
            
            if (response && response.RequestId) {
                const instance = response.Instance || {};
                
                return {
                    code: 200,
                    message: 'success',
                    request_id: response.RequestId,
                    call_log_url: instance.CallLogUrl || '',
                    runtime_config: JSON.stringify(instance.RuntimeConfig || {}),
                    status: instance.Status || '',
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
            return {
                code: error.statusCode || 500,
                message: error.message || '未知错误',
                request_id: error.requestId || '',
                error_code: error.code || 'UnknownError'
            };
        }
    }

    async getRtcAuthToken(userId, channelId) {
        try {
            logger.info('AiAgentService.getRtcAuthToken called:', { userId, channelId });
            
            // 参考 Java 代码，这里返回 mock 数据
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
     * 生成AI智能体实例
     * 参考 Java 代码：不需要调用阿里云 API 创建实例，直接使用已有的 agentId
     */
    async generateAIAgentCall(params) {
        const startTime = Date.now();
        
        const {
            user_id,
            ai_agent_id,
            region = 'cn-hangzhou'
        } = params;

        try {
            logger.info('generateAIAgentCall request:', {
                user_id,
                ai_agent_id,
                region
            });

            // 参考 Java 代码：直接返回成功响应，使用已有的 agentId
            const response = {
                code: 200,
                ai_agent_instance_id: ai_agent_id || `instance_${Date.now()}`,
                channel_id: `channel_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
                ai_agent_user_id: user_id,
                rtc_auth_token: `rtc_token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`,
                request_id: `req_${Date.now()}`
            };

            logger.info('generateAIAgentCall response:', {
                response,
                cost: `${Date.now() - startTime}ms`
            });

            return response;

        } catch (error) {
            logger.error('generateAIAgentCall error:', error);
            
            return {
                code: 500,
                message: error.message || '生成AI代理实例失败',
                request_id: '',
                error_code: error.code || 'InternalError'
            };
        }
    }

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

    async batchDescribeAiAgentInstances(instanceIds, region) {
        const promises = instanceIds.map(instanceId =>
            this.describeAiAgentInstance(instanceId, region).catch(error => error)
        );
        return Promise.all(promises);
    }
}

module.exports = new AiAgentService();