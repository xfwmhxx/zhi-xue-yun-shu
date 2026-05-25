const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
const authRoutes = require('./routes/auth');
const knowledgeRoutes = require('./routes/knowledge');
const aiRoutes = require('./routes/ai');
const bookRoutes = require('./routes/book');
const summaryRoutes = require('./routes/summary');
const resumeRoutes = require('./routes/resume');
const interviewRoutes = require('./routes/interview');
const interviewRecordRoutes = require('./routes/interviewRecord');
const aiAgentRouter = require('./routes/aiAgent.routes');





app.use('/api/auth', authRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/interview-record', interviewRecordRoutes);
app.use('/api/v2/aiagent', aiAgentRouter);

// 静态路由
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

module.exports = app;