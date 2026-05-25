const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');

// ========== 知识点相关 ==========
// 获取所有知识点列表
router.get('/points', knowledgeController.getAllPoints);

// 获取完整知识图谱（节点+边）
router.get('/graph', knowledgeController.getFullGraph);

// 获取单个知识点详情
router.get('/points/:id', knowledgeController.getPointById);

// 获取某个知识点的关联知识点
router.get('/relations/:pointId', knowledgeController.getRelationsByPoint);

// ========== 掌握度相关 ==========
// 获取用户所有知识点掌握度
router.get('/mastery/user/:userId', knowledgeController.getUserMastery);

// 获取用户对单个知识点的掌握度
router.get('/mastery/:userId/:pointId', knowledgeController.getPointMastery);

// 更新单个知识点掌握度
router.post('/mastery/update', knowledgeController.updateMastery);

// 批量更新掌握度
router.post('/mastery/batch-update', knowledgeController.batchUpdateMastery);
// 随机获取知识点
router.get('/random-points', knowledgeController.getRandomPoints);

// 摸底测试批量更新掌握度（只加分）
router.post('/mastery/batch-add', knowledgeController.batchUpdateMasteryOnlyAdd);

// 获取用户某段时间内的知识点浮动统计
router.get('/float-stats/:userId', knowledgeController.getUserFloatStats);

// 获取用户今日学习活跃度
router.get('/today-activity/:userId', knowledgeController.getTodayActivity);

// 获取用户当天的学习的所有知识点的浮动详情
router.get('/today-details/:userId', knowledgeController.getTodayKpDetails);

// 获取用户模块表现
router.get('/module-performance/:userId', knowledgeController.getModulePerformance);

module.exports = router;