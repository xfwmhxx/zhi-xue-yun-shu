// dtos/responses/generateMessageChatToken.response.js

/**
 * 生成消息聊天令牌响应DTO
 * 对应Java的GenerateMessageChatTokenResponse
 */
class GenerateMessageChatTokenResponse {
    /**
     * 构造函数
     * @param {Object} data - 初始化数据
     */
    constructor(data = {}) {
        this.code = data.code || 200;
        this.message = data.message || '';
        this.error_code = data.error_code || data.errorCode || '';
        this.request_id = data.request_id || data.requestId || '';
        this.app_id = data.app_id || data.appId || '';
        this.token = data.token || '';
        this.user_id = data.user_id || data.userId || '';
        this.nonce = data.nonce || '';
        this.role = data.role || 'user';
        this.timestamp = data.timestamp || Date.now();
        this.app_sign = data.app_sign || data.appSign || '';
    }

    /**
     * 构建器模式（对应@Builder）
     */
    static builder() {
        return new GenerateMessageChatTokenResponseBuilder();
    }

    /**
     * 创建成功响应
     * @param {Object} data - 响应数据
     */
    static success(data = {}) {
        return new GenerateMessageChatTokenResponse({
            code: 200,
            message: 'success',
            ...data,
            timestamp: data.timestamp || Date.now()
        });
    }

    /**
     * 创建错误响应
     * @param {string} errorCode - 错误码
     * @param {string} message - 错误信息
     * @param {Object} extra - 额外数据
     */
    static error(errorCode, message, extra = {}) {
        return new GenerateMessageChatTokenResponse({
            code: 500,
            error_code: errorCode,
            message: message,
            ...extra,
            timestamp: Date.now()
        });
    }

    /**
     * 从API响应创建实例（用于转换阿里云API响应）
     * @param {Object} apiResponse - 阿里云API响应
     * @param {Object} params - 生成token时的参数
     */
    static fromApiResponse(apiResponse, params = {}) {
        const timestamp = Date.now();
        const nonce = generateNonce(); // 生成随机数
        
        return new GenerateMessageChatTokenResponse({
            code: apiResponse.Code === 'OK' ? 200 : 500,
            message: apiResponse.Message || 'success',
            error_code: apiResponse.Code,
            request_id: apiResponse.RequestId,
            app_id: params.appId || process.env.APP_ID,
            token: apiResponse.Token || generateToken(params),
            user_id: params.userId,
            nonce: nonce,
            role: params.role || 'user',
            timestamp: timestamp,
            app_sign: generateAppSign(params, timestamp, nonce)
        });
    }

    /**
     * 转换为JSON格式（对应@JsonProperty）
     */
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            error_code: this.error_code,
            request_id: this.request_id,
            app_id: this.app_id,
            token: this.token,
            user_id: this.user_id,
            nonce: this.nonce,
            role: this.role,
            timestamp: this.timestamp,
            app_sign: this.app_sign
        };
    }

    /**
     * 转换为服务层使用的格式（驼峰命名）
     */
    toService() {
        return {
            code: this.code,
            message: this.message,
            errorCode: this.error_code,
            requestId: this.request_id,
            appId: this.app_id,
            token: this.token,
            userId: this.user_id,
            nonce: this.nonce,
            role: this.role,
            timestamp: this.timestamp,
            appSign: this.app_sign
        };
    }

    /**
     * 检查是否是成功响应
     */
    isSuccess() {
        return this.code === 200 && !this.error_code;
    }

    /**
     * 获取token信息摘要
     */
    getTokenInfo() {
        return {
            userId: this.user_id,
            role: this.role,
            appId: this.app_id,
            expiresIn: this.getExpiresIn()
        };
    }

    /**
     * 计算token过期时间（假设token有效期为24小时）
     */
    getExpiresIn() {
        return 24 * 60 * 60 * 1000; // 24小时（毫秒）
    }

    /**
     * 检查token是否过期
     */
    isTokenExpired() {
        const tokenAge = Date.now() - this.timestamp;
        return tokenAge > this.getExpiresIn();
    }

    /**
     * 验证app签名
     * @param {string} secret - 密钥
     */
    verifyAppSign(secret) {
        const calculatedSign = generateAppSign({
            appId: this.app_id,
            userId: this.user_id,
            role: this.role
        }, this.timestamp, this.nonce, secret);
        
        return calculatedSign === this.app_sign;
    }
}

/**
 * 构建器类（对应@Builder）
 */
class GenerateMessageChatTokenResponseBuilder {
    constructor() {
        this.data = {};
    }

    code(code) {
        this.data.code = code;
        return this;
    }

    message(message) {
        this.data.message = message;
        return this;
    }

    errorCode(errorCode) {
        this.data.error_code = errorCode;
        return this;
    }

    requestId(requestId) {
        this.data.request_id = requestId;
        return this;
    }

    appId(appId) {
        this.data.app_id = appId;
        return this;
    }

    token(token) {
        this.data.token = token;
        return this;
    }

    userId(userId) {
        this.data.user_id = userId;
        return this;
    }

    nonce(nonce) {
        this.data.nonce = nonce;
        return this;
    }

    role(role) {
        this.data.role = role;
        return this;
    }

    timestamp(timestamp) {
        this.data.timestamp = timestamp;
        return this;
    }

    appSign(appSign) {
        this.data.app_sign = appSign;
        return this;
    }

    /**
     * 构建响应实例
     */
    build() {
        return new GenerateMessageChatTokenResponse(this.data);
    }
}

/**
 * 工具函数：生成随机数
 */
function generateNonce(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
        nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
}

/**
 * 工具函数：生成token
 */
function generateToken(params = {}) {
    // 这里应该使用实际的token生成逻辑
    // 例如JWT或阿里云IM服务的token
    const { userId, appId, role } = params;
    const timestamp = Date.now();
    const nonce = generateNonce();
    
    // 示例：生成简单的token
    const token = Buffer.from(`${appId}:${userId}:${role}:${timestamp}:${nonce}`).toString('base64');
    
    return token;
}

/**
 * 工具函数：生成应用签名
 */
function generateAppSign(params, timestamp, nonce, secret = process.env.APP_SECRET) {
    const crypto = require('crypto');
    const { appId, userId, role } = params;
    
    // 构建签名字符串
    const signStr = `${appId}|${userId}|${role}|${timestamp}|${nonce}|${secret}`;
    
    // 生成SHA256签名
    return crypto.createHash('sha256').update(signStr).digest('hex');
}

module.exports = GenerateMessageChatTokenResponse;