// dtos/responses/aiAgentInstanceDescribe.response.js

/**
 * AI代理实例描述响应DTO
 * 对应Java的AiAgentInstanceDescribeResponse
 */
class AiAgentInstanceDescribeResponse {
    /**
     * 构造函数
     * @param {Object} data - 初始化数据
     */
    constructor(data = {}) {
        this.code = data.code || 200;
        this.error_code = data.error_code || data.errorCode || '';
        this.message = data.message || '';
        this.request_id = data.request_id || data.requestId || '';
        this.call_log_url = data.call_log_url || data.callLogUrl || '';
        this.runtime_config = data.runtime_config || data.runtimeConfig || '';
        this.status = data.status || '';
        this.template_config = data.template_config || data.templateConfig || '';
        this.user_data = data.user_data || data.userData || '';
    }

    /**
     * 构建器模式（对应@Builder）
     */
    static builder() {
        return new AiAgentInstanceDescribeResponseBuilder();
    }

    /**
     * 创建成功响应
     * @param {Object} data - 响应数据
     */
    static success(data = {}) {
        return new AiAgentInstanceDescribeResponse({
            code: 200,
            message: 'success',
            ...data
        });
    }

    /**
     * 创建错误响应
     * @param {string} errorCode - 错误码
     * @param {string} message - 错误信息
     * @param {Object} extra - 额外数据
     */
    static error(errorCode, message, extra = {}) {
        return new AiAgentInstanceDescribeResponse({
            code: 500,
            error_code: errorCode,
            message: message,
            ...extra
        });
    }

    /**
     * 从API响应创建实例（用于转换阿里云API响应）
     * @param {Object} apiResponse - 阿里云API响应
     */
    static fromApiResponse(apiResponse) {
        return new AiAgentInstanceDescribeResponse({
            code: apiResponse.Code === 'OK' ? 200 : 500,
            error_code: apiResponse.Code,
            message: apiResponse.Message,
            request_id: apiResponse.RequestId,
            call_log_url: apiResponse.CallLogUrl,
            runtime_config: apiResponse.RuntimeConfig,
            status: apiResponse.Status,
            template_config: apiResponse.TemplateConfig,
            user_data: apiResponse.UserData
        });
    }

    /**
     * 转换为JSON格式（对应@JsonProperty）
     */
    toJSON() {
        return {
            code: this.code,
            error_code: this.error_code,
            message: this.message,
            request_id: this.request_id,
            call_log_url: this.call_log_url,
            runtime_config: this.runtime_config,
            status: this.status,
            template_config: this.template_config,
            user_data: this.user_data
        };
    }

    /**
     * 转换为服务层使用的格式（驼峰命名）
     */
    toService() {
        return {
            code: this.code,
            errorCode: this.error_code,
            message: this.message,
            requestId: this.request_id,
            callLogUrl: this.call_log_url,
            runtimeConfig: this.runtime_config,
            status: this.status,
            templateConfig: this.template_config,
            userData: this.user_data
        };
    }

    /**
     * 检查是否是成功响应
     */
    isSuccess() {
        return this.code === 200 && !this.error_code;
    }

    /**
     * 获取状态描述
     */
    getStatusText() {
        const statusMap = {
            'running': '运行中',
            'stopped': '已停止',
            'error': '错误',
            'pending': '等待中'
        };
        return statusMap[this.status] || this.status;
    }

    /**
     * 解析runtime_config为对象
     */
    getRuntimeConfigObject() {
        try {
            return this.runtime_config ? JSON.parse(this.runtime_config) : {};
        } catch (e) {
            return {};
        }
    }

    /**
     * 解析template_config为对象
     */
    getTemplateConfigObject() {
        try {
            return this.template_config ? JSON.parse(this.template_config) : {};
        } catch (e) {
            return {};
        }
    }

    /**
     * 解析user_data为对象
     */
    getUserDataObject() {
        try {
            return this.user_data ? JSON.parse(this.user_data) : {};
        } catch (e) {
            return {};
        }
    }
}

/**
 * 构建器类（对应@Builder）
 */
class AiAgentInstanceDescribeResponseBuilder {
    constructor() {
        this.data = {};
    }

    code(code) {
        this.data.code = code;
        return this;
    }

    errorCode(errorCode) {
        this.data.error_code = errorCode;
        return this;
    }

    message(message) {
        this.data.message = message;
        return this;
    }

    requestId(requestId) {
        this.data.request_id = requestId;
        return this;
    }

    callLogUrl(callLogUrl) {
        this.data.call_log_url = callLogUrl;
        return this;
    }

    runtimeConfig(runtimeConfig) {
        this.data.runtime_config = runtimeConfig;
        return this;
    }

    status(status) {
        this.data.status = status;
        return this;
    }

    templateConfig(templateConfig) {
        this.data.template_config = templateConfig;
        return this;
    }

    userData(userData) {
        this.data.user_data = userData;
        return this;
    }

    /**
     * 构建响应实例
     */
    build() {
        return new AiAgentInstanceDescribeResponse(this.data);
    }
}

module.exports = AiAgentInstanceDescribeResponse;