// utils/result.util.js

/**
 * 统一响应结果类
 * 对应Java的Result，继承自Map
 */
class Result {
    constructor() {
        this.data = new Map();
        this.data.set('code', 200);
    }

    /**
     * 静态工厂方法 - 创建错误响应（默认500）
     */
    static error() {
        return Result.error(500, '服务器异常，请稍后重试');
    }

    /**
     * 静态工厂方法 - 404错误
     */
    static notFound() {
        return Result.error(404, '未查询到');
    }

    /**
     * 静态工厂方法 - 401参数错误
     */
    static invalidParam() {
        return Result.error(401, '参数错误');
    }

    /**
     * 静态工厂方法 - 自定义错误消息（默认500）
     */
    static error(msg) {
        return Result.error(500, msg);
    }

    /**
     * 静态工厂方法 - 自定义错误码和消息
     */
    static error(code, msg) {
        const result = new Result();
        result.put('code', code);
        result.put('message', msg);
        return result;
    }

    /**
     * 静态工厂方法 - 成功响应（带消息）
     */
    static ok(msg) {
        const result = new Result();
        result.put('message', msg);
        return result;
    }

    /**
     * 静态工厂方法 - 成功响应（带数据Map）
     */
    static ok(map) {
        const result = new Result();
        if (map instanceof Map) {
            for (const [key, value] of map) {
                result.put(key, value);
            }
        } else if (typeof map === 'object' && map !== null) {
            Object.entries(map).forEach(([key, value]) => {
                result.put(key, value);
            });
        }
        return result;
    }

    /**
     * 静态工厂方法 - 成功响应（默认）
     */
    static ok() {
        return new Result();
    }

    /**
     * 添加键值对（支持链式调用）
     */
    put(key, value) {
        this.data.set(key, value);
        return this;
    }

    /**
     * 获取值
     */
    get(key) {
        return this.data.get(key);
    }

    /**
     * 转换为普通对象
     */
    toJSON() {
        const obj = {};
        for (const [key, value] of this.data) {
            obj[key] = value;
        }
        return obj;
    }

    /**
     * 转换为Map
     */
    toMap() {
        return new Map(this.data);
    }

    /**
     * 获取响应状态码
     */
    getStatusCode() {
        return this.data.get('code') || 200;
    }

    /**
     * 判断是否成功
     */
    isSuccess() {
        const code = this.data.get('code');
        return code >= 200 && code < 300;
    }
}

/**
 * 响应中间件 - 将result方法添加到res对象
 */
const responseMiddleware = (req, res, next) => {
    // 添加成功响应方法
    res.success = (data = null, message = 'success') => {
        const result = Result.ok();
        result.put('message', message);
        if (data !== null) {
            result.put('data', data);
        }
        return res.status(200).json(result.toJSON());
    };

    // 添加错误响应方法
    res.error = (code = 500, message = '服务器异常，请稍后重试') => {
        const result = Result.error(code, message);
        return res.status(code).json(result.toJSON());
    };

    // 添加404响应方法
    res.notFound = (message = '未查询到') => {
        return res.error(404, message);
    };

    // 添加参数错误响应方法
    res.invalidParam = (message = '参数错误') => {
        return res.error(401, message);
    };

    next();
};

module.exports = {
    Result,
    responseMiddleware
};