// dtos/responses/rtcAuthToken.response.js

/**
 * RTC认证令牌响应DTO
 * 对应Java的RtcAuthTokenResponse
 */
class RtcAuthTokenResponse {
    /**
     * 构造函数
     * @param {Object} data - 初始化数据
     */
    constructor(data = {}) {
        this.auth_token = data.auth_token || data.authToken || '';
        this.timestamp = data.timestamp || Date.now();
    }

    /**
     * 构建器模式（对应@Builder）
     */
    static builder() {
        return new RtcAuthTokenResponseBuilder();
    }

    /**
     * 创建成功响应
     * @param {string} authToken - RTC认证令牌
     */
    static success(authToken) {
        return new RtcAuthTokenResponse({
            auth_token: authToken,
            timestamp: Date.now()
        });
    }

    /**
     * 从JWT令牌创建响应
     * @param {string} token - JWT令牌
     * @param {Object} payload - JWT载荷
     */
    static fromJwt(token, payload = {}) {
        return new RtcAuthTokenResponse({
            auth_token: token,
            timestamp: payload.iat ? payload.iat * 1000 : Date.now()
        });
    }

    /**
     * 从阿里云RTC API响应创建
     * @param {Object} apiResponse - 阿里云RTC API响应
     */
    static fromAliyunResponse(apiResponse) {
        return new RtcAuthTokenResponse({
            auth_token: apiResponse.AuthToken || apiResponse.Token,
            timestamp: Date.now()
        });
    }

    /**
     * 转换为JSON格式（对应@JsonProperty）
     */
    toJSON() {
        return {
            auth_token: this.auth_token,
            timestamp: this.timestamp
        };
    }

    /**
     * 转换为服务层使用的格式（驼峰命名）
     */
    toService() {
        return {
            authToken: this.auth_token,
            timestamp: this.timestamp
        };
    }

    /**
     * 获取认证头信息
     */
    getAuthHeader() {
        return `Bearer ${this.auth_token}`;
    }

    /**
     * 检查令牌是否过期
     * @param {number} expiresIn - 过期时间（毫秒）
     */
    isExpired(expiresIn = 24 * 60 * 60 * 1000) {
        const tokenAge = Date.now() - this.timestamp;
        return tokenAge > expiresIn;
    }

    /**
     * 获取令牌有效期（剩余毫秒数）
     * @param {number} expiresIn - 过期时间（毫秒）
     */
    getRemainingTime(expiresIn = 24 * 60 * 60 * 1000) {
        const tokenAge = Date.now() - this.timestamp;
        const remaining = expiresIn - tokenAge;
        return remaining > 0 ? remaining : 0;
    }

    /**
     * 获取令牌信息摘要
     */
    getTokenInfo() {
        return {
            token: this.auth_token.substring(0, 20) + '...', // 只显示前20个字符
            issuedAt: new Date(this.timestamp).toISOString(),
            expiresAt: new Date(this.timestamp + 24 * 60 * 60 * 1000).toISOString()
        };
    }

    /**
     * 转换为字符串（对应@Data的toString）
     */
    toString() {
        return `RtcAuthTokenResponse(auth_token=${this.auth_token.substring(0, 20)}..., timestamp=${this.timestamp})`;
    }

    /**
     * 判断是否相等（对应@Data的equals）
     */
    equals(other) {
        if (!(other instanceof RtcAuthTokenResponse)) return false;
        return this.auth_token === other.auth_token && 
               this.timestamp === other.timestamp;
    }
}

/**
 * 构建器类（对应@Builder）
 */
class RtcAuthTokenResponseBuilder {
    constructor() {
        this.data = {};
    }

    /**
     * 设置认证令牌
     */
    authToken(authToken) {
        this.data.auth_token = authToken;
        return this;
    }

    /**
     * 设置时间戳
     */
    timestamp(timestamp) {
        this.data.timestamp = timestamp;
        return this;
    }

    /**
     * 构建响应实例
     */
    build() {
        return new RtcAuthTokenResponse(this.data);
    }
}

module.exports = RtcAuthTokenResponse;