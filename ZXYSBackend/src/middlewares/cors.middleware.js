// middlewares/cors.middleware.js
const cors = require('cors');

/**
 * CORS配置
 * 对应Java的CorsFilter
 */
const corsOptions = {
    // 对应Access-Control-Allow-Origin
    origin: process.env.HTTP_CORS_HOST || '*',
    
    // 对应Access-Control-Allow-Methods
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'PUT'],
    
    // 对应Access-Control-Allow-Headers
    allowedHeaders: ['authorization', 'content-type'],
    
    // 对应Access-Control-Allow-Credentials
    credentials: true,
    
    // 对应OPTIONS请求的处理
    optionsSuccessStatus: 204 // 对应HttpStatus.NO_CONTENT.value()
};

// 创建cors中间件
const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;