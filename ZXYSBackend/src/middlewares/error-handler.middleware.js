// middlewares/error-handler.middleware.js
const BizException = require('../exceptions/biz.exception');
const logger = require('../utils/logger'); // 对应@Slf4j

/**
 * 统一响应结果类
 * 对应Java的Result
 */
class Result {
    constructor() {
        this.code = 500;
        this.msg = '服务器内部错误';
    }

    /**
     * 创建错误响应
     */
    static error(msg = '服务器内部错误', code = 500) {
        const result = new Result();
        result.code = code;
        result.msg = msg;
        return result;
    }

    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            code: this.code,
            msg: this.msg
        };
    }
}

/**
 * 全局异常处理器中间件
 * 对应@RestControllerAdvice
 */
const errorHandler = (err, req, res, next) => {
    // 记录错误日志（对应log.error(e.getMessage(), e)）
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        path: req.path,
        method: req.method,
        ip: req.ip,
        body: req.body,
        query: req.query,
        params: req.params
    });

    // 处理业务异常（对应@ExceptionHandler(BizException.class)）
    if (err instanceof BizException) {
        const result = new Result();
        result.code = err.code;
        result.msg = err.msg || err.message;
        
        return res.status(err.code).json(result);
    }

    // 处理其他异常（对应@ExceptionHandler(Exception.class)）
    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    let message = '服务器内部错误';

    // 处理不同类型的异常
    if (err.name === 'ValidationError' || err.isJoi) {
        statusCode = 400;
        message = '参数验证失败';
    } else if (err.name === 'UnauthorizedError' || err.code === 401) {
        statusCode = 401;
        message = '未授权访问';
    } else if (err.name === 'ForbiddenError' || err.code === 403) {
        statusCode = 403;
        message = '禁止访问';
    } else if (err.name === 'NotFoundError' || err.code === 404) {
        statusCode = 404;
        message = '资源不存在';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = '文件大小超过限制';
    }

    // 生产环境不暴露错误堆栈
    const response = Result.error(
        process.env.NODE_ENV === 'production' ? message : err.message,
        statusCode
    );

    res.status(statusCode).json(response);
};

/**
 * 404错误处理中间件
 * 处理不存在的路由
 */
const notFoundHandler = (req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.path}`);

    const result = Result.error('接口不存在', 404);
    res.status(404).json(result);
};

/**
 * 异步错误包装器
 * 用于捕获异步路由中的错误
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    Result
};