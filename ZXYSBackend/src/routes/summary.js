const express = require('express');
const router = express.Router();
const { requestAISummary, getSummary, updateTaskProgress, requestUserPortrait, getUserPortrait } = require('../services/aiSummaryService');
// 请求生成今日总结
router.post('/generate', async (req, res) => {
  const { user_id } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ code: 400, message: '缺少用户ID' });
  }
  
  const result = await requestAISummary(parseInt(user_id));
  res.json(result);
});

// 获取今日总结（用于轮询）
router.get('/today/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const result = await getSummary(parseInt(userId));
  res.json(result);
});

// 更新任务进度
router.put('/task/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { user_id, current_value } = req.body;
  
  if (!user_id || current_value === undefined) {
    return res.status(400).json({ code: 400, message: '缺少必要参数' });
  }
  
  const result = await updateTaskProgress(parseInt(user_id), parseInt(taskId), current_value);
  res.json(result);
});

// ========== 新增：用户画像相关路由 ==========

// 获取用户画像
router.get('/portrait/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const result = await getUserPortrait(parseInt(userId));
  res.json(result);
});

module.exports = router;