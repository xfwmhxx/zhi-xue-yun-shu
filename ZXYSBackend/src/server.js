const app = require('./app');
const { initDatabase } = require('./models');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// 启动服务器
const startServer = async () => {
  try {
    // 先初始化数据库
    await initDatabase();
    
    // 再启动 HTTP 服务
    app.listen(PORT,HOST, () => {
      console.log(`服务器运行在 http://${HOST}:${PORT}`);
      console.log(`健康检查: http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    console.error('服务启动失败:', error);
    process.exit(1);
  }
};

startServer();