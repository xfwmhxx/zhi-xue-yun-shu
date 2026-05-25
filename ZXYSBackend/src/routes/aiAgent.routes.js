// routes/aiAgent.routes.js
const express = require('express');
const router = express.Router();
const aiAgentControllerV2 = require('../controllers/aiAgent.controller');
const { asyncHandler } = require('../middlewares/error-handler.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');
const tokenAuthMiddleware = require('../middlewares/auth.middleware');

// 导入DTO
const GenerateMessageChatTokenRequestDto = require('../dtos/generateMessageChatTokenRequest.dto');
const RtcAuthTokenRequestDto = require('../dtos/rtcAuthTokenRequest.dto');
const AiAgentInstanceDescribeRequestDto = require('../dtos/aiAgentInstanceDescribeRequest.dto');
const GenerateAIAgentCallRequestDto = require('../dtos/generateAIAgentCallRequest.dto');

console.log('✅ DTOs loaded successfully');
console.log('📦 GenerateMessageChatTokenRequestDto:', !!GenerateMessageChatTokenRequestDto);
console.log('📦 RtcAuthTokenRequestDto:', !!RtcAuthTokenRequestDto);
console.log('📦 AiAgentInstanceDescribeRequestDto:', !!AiAgentInstanceDescribeRequestDto);

// 验证DTO是否有validators方法
if (typeof GenerateMessageChatTokenRequestDto.validators !== 'function') {
    console.warn('⚠️ GenerateMessageChatTokenRequestDto.validators is not a function');
}
if (typeof RtcAuthTokenRequestDto.validators !== 'function') {
    console.warn('⚠️ RtcAuthTokenRequestDto.validators is not a function');
}
if (typeof AiAgentInstanceDescribeRequestDto.validators !== 'function') {
    console.warn('⚠️ AiAgentInstanceDescribeRequestDto.validators is not a function');
}

// 应用认证中间件
if (typeof tokenAuthMiddleware === 'function') {
    router.use(tokenAuthMiddleware);
    console.log('✅ Auth middleware applied');
} else {
    console.warn('⚠️ tokenAuthMiddleware is not a function, auth skipped');
}

/**
 * ========== 生产环境路由 ==========
 */

// 生成消息聊天令牌
router.post(
    '/generateMessageChatToken',
    validateRequest(GenerateMessageChatTokenRequestDto.validators()),
    asyncHandler(aiAgentControllerV2.generateMessageChatToken.bind(aiAgentControllerV2))
);

// 获取RTC认证令牌
router.post(
    '/getRtcAuthToken',
    validateRequest(RtcAuthTokenRequestDto.validators()),
    asyncHandler(aiAgentControllerV2.getRtcAuthToken.bind(aiAgentControllerV2))
);

// 描述AI代理实例
router.post(
    '/describeAIAgentInstance',
    validateRequest(AiAgentInstanceDescribeRequestDto.validators()),
    asyncHandler(aiAgentControllerV2.describeAIAgentInstance.bind(aiAgentControllerV2))
);

// 生成AI智能体实例（新增）
router.post(
    '/generateAIAgentCall',
    validateRequest(GenerateAIAgentCallRequestDto.validators()),
    asyncHandler(aiAgentControllerV2.generateAIAgentCall.bind(aiAgentControllerV2))
);
/**
 * ========== 测试路由 ==========
 */

// 1. 基础测试 - 直接调用控制器方法
router.get('/test/getRtcAuthToken', async (req, res) => {
    try {
        console.log('\n🧪 ===== Testing getRtcAuthToken directly =====');
        
        // 创建一个模拟的request对象
        const mockReq = {
            body: {
                channel_id: req.query.channel_id || 'test_channel_123',
                user_id: req.query.user_id || 'test_user_456'
            }
        };
        
        // 创建一个模拟的response对象
        let responseData = null;
        const mockRes = {
            json: (data) => {
                console.log('✅ Mock response received');
                responseData = data;
                return mockRes;
            },
            status: (code) => {
                console.log(`Response status: ${code}`);
                return mockRes;
            }
        };
        
        // 创建一个模拟的next函数
        const mockNext = (err) => {
            if (err) throw err;
        };
        
        // 直接调用控制器方法
        await aiAgentControllerV2.getRtcAuthToken(mockReq, mockRes, mockNext);
        
        res.json({
            test: 'direct_controller_call',
            success: true,
            request: mockReq.body,
            response: responseData
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        res.status(500).json({
            test: 'direct_controller_call',
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// 2. 测试服务层 - 直接调用服务
router.get('/test/service/getRtcAuthToken', async (req, res) => {
    try {
        console.log('\n🧪 ===== Testing service layer directly =====');
        
        // 动态导入服务类
        const ImsServiceImpl = require('../services/interface/ims.service.impl');
        console.log('1. Service class loaded:', !!ImsServiceImpl);
        console.log('2. Service class type:', typeof ImsServiceImpl);
        
        // 创建服务实例
        const imsService = new ImsServiceImpl();
        console.log('3. Service instance created');
        console.log('4. Instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(imsService)));
        
        // 验证getRtcAuthToken方法
        if (typeof imsService.getRtcAuthToken !== 'function') {
            throw new Error('getRtcAuthToken method not found in service instance');
        }
        console.log('5. ✅ getRtcAuthToken method exists');
        
        // 准备测试数据
        const testDto = {
            channel_id: req.query.channel_id || 'test_channel_123',
            user_id: req.query.user_id || 'test_user_456'
        };
        
        console.log('6. Test DTO:', testDto);
        
        // 调用服务方法
        console.log('7. Calling getRtcAuthToken...');
        const result = await imsService.getRtcAuthToken(testDto);
        console.log('8. Service result:', result);
        
        res.json({
            test: 'service_direct_call',
            success: true,
            dto: testDto,
            serviceMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(imsService)),
            result: result
        });
        
    } catch (error) {
        console.error('❌ Service test failed:', error);
        res.status(500).json({
            test: 'service_direct_call',
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// 3. 完整的API测试 - 通过所有中间件
router.post('/test/api/getRtcAuthToken', 
    (req, res, next) => {
        console.log('\n🧪 ===== Testing full API with middleware =====');
        console.log('Request body:', req.body);
        next();
    },
    validateRequest(RtcAuthTokenRequestDto.validators()),
    asyncHandler(async (req, res) => {
        try {
            // 记录开始时间
            const startTime = Date.now();
            
            // 创建一个Promise来包装控制器调用
            await new Promise((resolve, reject) => {
                const mockNext = (err) => {
                    if (err) reject(err);
                    else resolve();
                };
                
                aiAgentControllerV2.getRtcAuthToken(req, res, mockNext);
            });
            
            // 记录结束时间
            const duration = Date.now() - startTime;
            console.log(`✅ API test completed in ${duration}ms`);
            
        } catch (error) {
            console.error('❌ API test failed:', error);
            res.status(500).json({
                test: 'full_api_test',
                error: error.message,
                stack: error.stack
            });
        }
    })
);

// 4. 调试路由 - 查看所有可用方法
router.get('/test/debug', (req, res) => {
    try {
        console.log('\n🔍 ===== Debug Information =====');
        
        // 检查服务
        const ImsServiceImpl = require('../services/interface/ims.service.impl');
        const imsServiceInstance = new ImsServiceImpl();
        const serviceMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(imsServiceInstance));
        
        // 检查控制器
        const controller = aiAgentControllerV2;
        const controllerMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
            .filter(name => name !== 'constructor');
        
        // 检查环境变量
        const envVars = {
            LIVE_MIC_APP_ID: process.env.LIVE_MIC_APP_ID ? '✅ Set' : '❌ Not set',
            LIVE_MIC_APP_KEY: process.env.LIVE_MIC_APP_KEY ? '✅ Set' : '❌ Not set',
            NODE_ENV: process.env.NODE_ENV || 'not set',
            PORT: process.env.PORT || '3000 (default)'
        };
        
        const debugInfo = {
            timestamp: new Date().toISOString(),
            environment: envVars,
            controller: {
                exists: !!controller,
                methods: controllerMethods,
                hasGetRtcAuthToken: controllerMethods.includes('getRtcAuthToken')
            },
            service: {
                classExists: !!ImsServiceImpl,
                instanceMethods: serviceMethods,
                hasGetRtcAuthToken: serviceMethods.includes('getRtcAuthToken'),
                hasGenerateMessageChatToken: serviceMethods.includes('generateMessageChatToken'),
                hasDescribeAiAgentInstance: serviceMethods.includes('describeAiAgentInstance')
            },
            dto: {
                generateMessageChatToken: {
                    exists: !!GenerateMessageChatTokenRequestDto,
                    hasValidators: typeof GenerateMessageChatTokenRequestDto?.validators === 'function'
                },
                rtcAuthToken: {
                    exists: !!RtcAuthTokenRequestDto,
                    hasValidators: typeof RtcAuthTokenRequestDto?.validators === 'function'
                },
                aiAgentInstanceDescribe: {
                    exists: !!AiAgentInstanceDescribeRequestDto,
                    hasValidators: typeof AiAgentInstanceDescribeRequestDto?.validators === 'function'
                }
            },
            middleware: {
                validateRequest: typeof validateRequest === 'function',
                tokenAuthMiddleware: typeof tokenAuthMiddleware === 'function'
            }
        };
        
        console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
        res.json(debugInfo);
        
    } catch (error) {
        console.error('Debug route error:', error);
        res.status(500).json({ 
            error: error.message, 
            stack: error.stack 
        });
    }
});

// 5. 简单测试 - 返回固定数据
router.get('/test/simple/rtc-token', (req, res) => {
    const mockData = {
        auth_token: 'test_auth_token_' + Date.now(),
        timestamp: Date.now()
    };
    
    console.log('✅ Simple test endpoint called');
    
    res.json({
        test: 'simple_test',
        message: 'Simple test endpoint',
        data: mockData,
        query: req.query
    });
});

// 6. 模拟RTC令牌生成测试
router.post('/test/mock/rtc-token', (req, res) => {
    try {
        console.log('\n🎭 ===== Mock RTC Token Generation =====');
        console.log('Request body:', req.body);
        
        const { channel_id, user_id } = req.body;
        
        // 模拟生成token
        const mockTokenData = {
            appid: process.env.LIVE_MIC_APP_ID || 'test_app_id',
            channelid: channel_id || 'test_channel',
            userid: user_id || 'test_user',
            nonce: Math.random().toString(36).substring(2, 15),
            timestamp: Date.now(),
            token: 'mock_signature_' + Date.now()
        };
        
        const mockToken = Buffer.from(JSON.stringify(mockTokenData)).toString('base64');
        
        const response = {
            success: true,
            message: 'Mock token generated',
            data: {
                auth_token: mockToken,
                timestamp: mockTokenData.timestamp
            },
            receivedParams: req.body,
            mockData: mockTokenData
        };
        
        console.log('✅ Mock token generated successfully');
        res.json(response);
        
    } catch (error) {
        console.error('❌ Mock token generation failed:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// 7. 健康检查路由
router.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'ai-agent-api',
        version: 'v2'
    });
});

console.log('\n📋 ===== Routes Registered =====');
console.log('✅ Production routes:');
console.log('  POST /generateMessageChatToken');
console.log('  POST /getRtcAuthToken');
console.log('  POST /describeAIAgentInstance');
console.log('  POST /generateAIAgentCall'); 

module.exports = router;