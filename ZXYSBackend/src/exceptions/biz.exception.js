// exceptions/biz.exception.js

/**
 * 自定义业务异常类
 * 对应Java的BizException
 */
class BizException extends Error {
    /**
     * 默认code值（对应@Builder.Default private int code = 500）
     */
    static DEFAULT_CODE = 500;
    
    /**
     * 序列化版本ID（对应serialVersionUID，在JS中主要用于标识）
     */
    static serialVersionUID = 1;

    /**
     * 构造函数
     * @param {string} msg - 错误消息
     * @param {number} code - 错误码，默认500
     * @param {Error} cause - 原始错误对象
     */
    constructor(msg, code = BizException.DEFAULT_CODE, cause = null) {
        // 调用父类Error构造函数
        super(msg);
        
        // 设置错误名称
        this.name = 'BizException';
        
        // 初始化字段（对应@Data）
        this.code = code;
        this.msg = msg;
        this.cause = cause;
        
        // 设置时间戳（额外添加，方便调试）
        this.timestamp = new Date().toISOString();
        
        // 捕获堆栈信息
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BizException);
        }
    }

    /**
     * 构建器模式（对应@Builder）
     */
    static builder() {
        return new BizExceptionBuilder();
    }

    /**
     * 创建异常实例（对应BizException(String msg)）
     * @param {string} msg - 错误消息
     */
    static of(msg) {
        return new BizException(msg);
    }

    /**
     * 创建异常实例（对应BizException(String msg, int code)）
     * @param {string} msg - 错误消息
     * @param {number} code - 错误码
     */
    static withCode(msg, code) {
        return new BizException(msg, code);
    }

    /**
     * 创建异常实例（对应BizException(String msg, Throwable e)）
     * @param {string} msg - 错误消息
     * @param {Error} cause - 原始错误
     */
    static withCause(msg, cause) {
        return new BizException(msg, BizException.DEFAULT_CODE, cause);
    }

    /**
     * 创建异常实例（对应BizException(String msg, int code, Throwable e)）
     * @param {string} msg - 错误消息
     * @param {number} code - 错误码
     * @param {Error} cause - 原始错误
     */
    static full(msg, code, cause) {
        return new BizException(msg, code, cause);
    }

    /**
     * 创建参数验证错误异常
     * @param {string} msg - 错误消息
     */
    static validationError(msg) {
        return new BizException(msg, 400);
    }

    /**
     * 创建未授权错误异常
     * @param {string} msg - 错误消息
     */
    static unauthorized(msg = '未授权访问') {
        return new BizException(msg, 401);
    }

    /**
     * 创建禁止访问错误异常
     * @param {string} msg - 错误消息
     */
    static forbidden(msg = '禁止访问') {
        return new BizException(msg, 403);
    }

    /**
     * 创建资源不存在错误异常
     * @param {string} msg - 错误消息
     */
    static notFound(msg = '资源不存在') {
        return new BizException(msg, 404);
    }

    /**
     * 创建服务器内部错误异常
     * @param {string} msg - 错误消息
     * @param {Error} cause - 原始错误
     */
    static internalError(msg = '服务器内部错误', cause = null) {
        return new BizException(msg, 500, cause);
    }

    /**
     * 转换为JSON格式（用于响应输出）
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.msg || this.message,
            timestamp: this.timestamp,
            cause: this.cause ? {
                message: this.cause.message,
                name: this.cause.name
            } : undefined
        };
    }

    /**
     * 转换为字符串（对应@Data的toString）
     */
    toString() {
        return `${this.name}: [${this.code}] ${this.msg || this.message}`;
    }

    /**
     * 获取错误码
     */
    getCode() {
        return this.code;
    }

    /**
     * 获取错误消息
     */
    getMsg() {
        return this.msg || this.message;
    }

    /**
     * 设置错误码（链式调用）
     */
    setCode(code) {
        this.code = code;
        return this;
    }

    /**
     * 设置错误消息（链式调用）
     */
    setMsg(msg) {
        this.msg = msg;
        this.message = msg;
        return this;
    }
}

/**
 * 构建器类（对应@Builder）
 */
class BizExceptionBuilder {
    constructor() {
        this.data = {
            code: BizException.DEFAULT_CODE,
            msg: '',
            cause: null
        };
    }

    /**
     * 设置错误码
     */
    code(code) {
        this.data.code = code;
        return this;
    }

    /**
     * 设置错误消息
     */
    msg(msg) {
        this.data.msg = msg;
        return this;
    }

    /**
     * 设置原始错误
     */
    cause(cause) {
        this.data.cause = cause;
        return this;
    }

    /**
     * 构建异常实例
     */
    build() {
        return new BizException(
            this.data.msg,
            this.data.code,
            this.data.cause
        );
    }
}

// 导出异常类
module.exports = BizException;