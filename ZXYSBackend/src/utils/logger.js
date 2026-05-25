// utils/logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

/**
 * 自定义日志格式
 * 对应@Slf4j的日志格式
 */
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
        
        // 添加元数据（如果有）
        if (Object.keys(meta).length > 0 && !stack) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        // 添加错误堆栈
        if (stack) {
            log += `\n${stack}`;
        }
        
        return log;
    })
);

/**
 * 创建Winston logger实例
 * 对应@Slf4j的功能
 */
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // 控制台输出（开发环境）
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        
        // 错误日志文件
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.uncolorize(),
                logFormat
            )
        }),
        
        // 所有日志文件
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.uncolorize(),
                logFormat
            )
        })
    ],
    
    // 退出时不等待日志写入完成
    exitOnError: false
});

/**
 * 添加请求日志方法
 * 用于记录HTTP请求
 */
logger.logRequest = (req, additionalInfo = {}) => {
    const logData = {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: req.user?.userId || req.user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
        ...additionalInfo
    };

    logger.info(`${req.method} ${req.url}`, logData);
};

/**
 * 添加响应日志方法
 */
logger.logResponse = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userId: req.user?.userId || req.user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
        logger.warn(`${req.method} ${req.url} ${res.statusCode}`, logData);
    } else {
        logger.info(`${req.method} ${req.url} ${res.statusCode}`, logData);
    }
};

/**
 * 添加错误日志方法
 * 用于记录异常
 */
logger.logError = (error, req = null, additionalInfo = {}) => {
    const logData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        ...additionalInfo
    };

    if (req) {
        logData.request = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            body: req.body,
            query: req.query,
            params: req.params,
            userId: req.user?.userId || req.user?.id
        };
    }

    if (error.cause) {
        logData.cause = {
            name: error.cause.name,
            message: error.cause.message,
            stack: error.cause.stack
        };
    }

    logger.error(error.message, logData);
};

/**
 * 添加性能日志方法
 */
logger.logPerformance = (action, duration, metadata = {}) => {
    const logData = {
        action,
        duration: `${duration}ms`,
        ...metadata
    };

    if (duration > 1000) {
        logger.warn(`Slow operation: ${action}`, logData);
    } else {
        logger.debug(`Performance: ${action}`, logData);
    }
};

/**
 * 添加数据库查询日志
 */
logger.logQuery = (query, duration, metadata = {}) => {
    const logData = {
        query: typeof query === 'string' ? query : JSON.stringify(query),
        duration: `${duration}ms`,
        ...metadata
    };

    if (duration > 500) {
        logger.warn('Slow query detected', logData);
    } else {
        logger.debug('Database query', logData);
    }
};

/**
 * 添加API调用日志
 */
logger.logApiCall = (service, method, params, response, duration) => {
    const logData = {
        service,
        method,
        params: params,
        responseStatus: response?.code || response?.status,
        duration: `${duration}ms`
    };

    if (response?.code === 200 || response?.status === 200) {
        logger.info(`API call success: ${service}.${method}`, logData);
    } else {
        logger.error(`API call failed: ${service}.${method}`, logData);
    }
};

/**
 * 创建子日志器（用于特定模块）
 */
logger.child = (module) => {
    const childLogger = Object.create(logger);
    
    // 重写日志方法，添加模块名
    ['debug', 'info', 'warn', 'error'].forEach(level => {
        const original = childLogger[level];
        childLogger[level] = (message, meta = {}) => {
            original.call(childLogger, `[${module}] ${message}`, meta);
        };
    });
    
    return childLogger;
};

/**
 * 请求日志中间件
 */
logger.requestMiddleware = () => {
    return (req, res, next) => {
        const startTime = Date.now();
        
        // 请求开始时记录
        logger.logRequest(req);
        
        // 响应结束时记录
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            logger.logResponse(req, res, duration);
        });
        
        next();
    };
};

module.exports = logger;