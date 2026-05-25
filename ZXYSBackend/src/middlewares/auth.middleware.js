// middlewares/auth.middleware.js
const logger = require('../utils/logger');

/**
 * Token认证中间件
 * 对应Java的TokenAuthenticationFilter
 */
class TokenAuthMiddleware {
    constructor() {
        // 对应Java的private static final String TOKEN_PREFIX = "Bearer"
        this.TOKEN_PREFIX = 'Bearer';
    }

    /**
     * 中间件处理函数
     * 对应doFilterInternal方法
     */
    handle = (req, res, next) => {
        try {
            // 记录请求日志（对应@Slf4j）
            logger.debug(`Processing request: ${req.method} ${req.url}`);

            // 创建认证信息（对应Authentication对象）
            const authentication = {
                token: this.TOKEN_PREFIX,
                authorities: [this.TOKEN_PREFIX],
                isAuthenticated: true
            };

            // 将认证信息附加到请求对象（对应SecurityContextHolder）
            req.user = authentication;
            
            // 也可以将认证信息存储在res.locals中（在整个请求生命周期可用）
            res.locals.auth = authentication;

            // 记录认证信息
            logger.debug(`Set authentication for request: ${JSON.stringify({
                token: authentication.token,
                authorities: authentication.authorities
            })}`);

            // 继续处理请求（对应filterChain.doFilter）
            next();
        } catch (error) {
            // 即使出错也继续处理（对应Java的固定逻辑）
            logger.error('Error in auth middleware:', error);
            next();
        }
    };

    /**
     * 获取当前用户信息
     * 对应SecurityContextHolder.getContext().getAuthentication()
     */
    getCurrentUser(req) {
        return req.user || {
            token: this.TOKEN_PREFIX,
            authorities: [this.TOKEN_PREFIX]
        };
    }

    /**
     * 检查用户是否有指定权限
     * 对应SecurityContextHolder的权限检查
     */
    hasAuthority(req, authority) {
        const user = this.getCurrentUser(req);
        return user.authorities && user.authorities.includes(authority);
    }

    /**
     * 检查用户是否有所有指定权限
     */
    hasAllAuthorities(req, authorities) {
        const user = this.getCurrentUser(req);
        return authorities.every(auth => user.authorities && user.authorities.includes(auth));
    }

    /**
     * 检查用户是否有任一指定权限
     */
    hasAnyAuthority(req, authorities) {
        const user = this.getCurrentUser(req);
        return authorities.some(auth => user.authorities && user.authorities.includes(auth));
    }
}

// 导出单例
const authMiddleware = new TokenAuthMiddleware();
module.exports = authMiddleware.handle.bind(authMiddleware);
module.exports.TokenAuthMiddleware = authMiddleware;