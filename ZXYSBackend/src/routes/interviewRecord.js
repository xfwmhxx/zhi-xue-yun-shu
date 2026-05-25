const express = require('express');
const multer = require('multer');
const { createSparkChat } = require('../utils/AI/iflytek');
const { createDeepSeekChat } = require('../utils/AI/deepseek')
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { InterviewRecord, InterviewPreparation } = require('../models');
// 星火AI配置
const sparkConfig = {
  appid: process.env.SPARK_APPID || '3efb053a',
  apiKey: process.env.SPARK_API_KEY || '3d73d5b03ccb0cd8834bb87797c45232',
  apiSecret: process.env.SPARK_API_SECRET || 'MzgzMzMwYWMzYjZlMzhiYmM0OWQ2Njc0',
  domain: 'lite',
};

// JSON解析工具函数
function tryParseJson(text) {
  try {
    const cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleanText);
  } catch (e) {
    return null;
  }
}

// 配置 multer 存储到 uploads 目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'emotionImg');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const recordId = req.params.id;
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const emotion = req.body.emotion || 'unknown';
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}_${emotion}_${recordId}_${uniqueId}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 构建AI分析提示词
function buildAnalysisPrompt(jobDescription, solveQuestions, emotionInspect) {
  const questionCount = solveQuestions.questions.length;
  
  return `你是一个严谨的中医面试官。请对以下面试数据进行深度审计。(本次是在路演，所以有些方面就算不佳也请给分，分数大胆给)

【1. 输入核心数据】
- 目标岗位：${jobDescription}
- 题目列表：${JSON.stringify(solveQuestions.questions)} (共 ${questionCount} 道题)
- 情绪监测流：${JSON.stringify(emotionInspect?.records || [])}

【2. 强制任务：全量分析 (CRITICAL)】
- **数量对齐**：输入了多少道题，"question_details" 数组中就必须包含多少道题的分析。
- **严禁遗漏**：目前共有 ${questionCount} 道题，你的 JSON 必须返回 ${questionCount} 个题目分析对象。

【3. 阶梯评分准则】
- 10-30分 (极差)：答非所问、内容重复、使用通用套话
- 31-60分 (不及格)：部分诊断但逻辑混乱，缺失关键证型
- 61-80分 (良好)：诊断基本准确，给出了治法但缺乏细节
- 81-100分 (优秀)：诊断、辨证、治法、方剂完全正确

【4. 严格 JSON 格式】
{
  "overall_score": 整数,
  "match_status": "评估结论",
  "summary": {
    "text": "200字以上深度综述",
    "persona": "人才画像标签",
    "risk_level": "低/中/高",
    "core_weakness": "最弱的一点"
  },
  "radar_chart": {
    "tcm_basis": 1-100,
    "diagnosis_ability": 1-100,
    "clinical_treatment": 1-100,
    "communication_stability": 1-100,
    "professionalism": 1-100
  },
  "dimension_details": {
    "专业基础": "评价内容",
    "辨证能力": "评价内容",
    "临床治法": "评价内容",
    "沟通稳定性": "评价内容",
    "职业素养": "评价内容"
  },
  "question_details": [
    {
      "id": "题目ID",
      "title": "题目简述",
      "score": 1-100,
      "user_answer": "候选人回答",
      "ai_feedback": "专业点评",
      "risk_tag": "风险标签",
      "model_answer": "参考要点"
    }
  ],
  "action_plan": ["建议1", "建议2", "建议3"]
}

直接返回 JSON，禁止包含 Markdown 格式块。`;
}

// 丰富分析结果
function enrichAnalysisResult(aiResult, metadata) {
  return {
    ...aiResult,
    analysis_id: `analysis_${Date.now()}_${metadata.recordId}`,
    generated_at: new Date().toISOString(),
    metadata: {
      model: 'deepseek-chat',
      record_id: metadata.recordId,
      user_id: metadata.userId,
      job_description: metadata.jobDescription
    }
  };
}


// 后台异步处理面试分析
async function processInterviewAnalysis(recordId, userId, jobDescription, solveQuestions, emotionInspect) {
  try {
    console.log(`[后台分析] 开始处理面试记录 ${recordId}`);
    
    // 调用AI分析服务
    const analysisResult = await callAIAnalysisService({
      recordId,
      userId,
      jobDescription,
      solveQuestions,
      emotionInspect
    });
    
    // 保存分析结果
    await InterviewRecord.update({
      analysis_result: JSON.stringify(analysisResult),
      state: 'completed',
      updated_at: new Date()
    }, {
      where: { id: recordId, state: 'analyzing' }
    });
    
    // 分析完成后删除面试准备记录
    await InterviewPreparation.destroy({ where: { user_id: userId } });
    
    console.log(`[后台分析] 面试记录 ${recordId} AI分析完成并保存`);
    return analysisResult;
  } catch (error) {
    console.error(`[后台分析] 面试记录 ${recordId} 分析失败:`, error);
    
    await InterviewRecord.update({
      state: 'failed',
      updated_at: new Date()
    }, {
      where: { id: recordId }
    });
    
    throw error;
  }
}

// 调用AI分析服务
async function callAIAnalysisService(data) {
  const { recordId, jobDescription, solveQuestions, emotionInspect } = data;
  
  const analysisPrompt = buildAnalysisPrompt(jobDescription, solveQuestions, emotionInspect);
  // DeepSeek 对 JSON 指令执行得非常好，可以保持或强化系统指令
  const systemInstruction = "\n\n重要要求：请务必只返回纯 JSON 格式的字符串，不要包含任何解释、前缀、后缀或 Markdown 代码块标签。";
  const finalPrompt = analysisPrompt + systemInstruction;
  
  const MAX_RETRIES = 3;
  let lastError = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[DeepSeek服务] 记录 ${recordId} 第 ${attempt} 次尝试`);
      
      // 实例化 DeepSeekChat
      const deepseek = createDeepSeekChat(); 
      // 调用 DeepSeek 的 sendMessage 方法
      const rawResponse = await deepseek.sendMessage(finalPrompt);
      
      const jsonData = tryParseJson(rawResponse);
      
      if (jsonData !== null) {
        console.log(`[DeepSeek服务] 记录 ${recordId} 分析成功`);
        return enrichAnalysisResult(jsonData, {
          recordId,
          userId: data.userId,
          jobDescription
        });
      } else {
        lastError = new Error('DeepSeek 返回的内容无法解析为 JSON');
      }
    } catch (error) {
      lastError = error;
      console.error(`[DeepSeek服务] 第 ${attempt} 次尝试失败:`, error.message);
    }
  }
  
  throw new Error(`AI分析失败: ${lastError?.message}`);
}

// 创建面试记录
router.post('/create', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ code: 400, message: '缺少用户ID' });
  }
  
  try {
    // 获取面试准备记录中的职位描述
    const preparation = await InterviewPreparation.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
    
    if (!preparation) {
      return res.status(404).json({ code: 404, message: '请先创建面试准备记录' });
    }
    
    const record = await InterviewRecord.create({
      user_id: userId,
      job_description: preparation.job_description,
      state: 'pending'
    });
    
    res.json({
      code: 200,
      message: '面试记录创建成功',
      data: {
        id: record.id,
        userId: record.user_id,
        jobDescription: record.job_description,
        state: record.state
      }
    });
  } catch (error) {
    console.error('创建面试记录失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 完成面试（提交答案，开始分析）
// 完成面试（提交答案，开始分析）
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { solve_questions, emotion_inspect, userId } = req.body;
  
  if (!solve_questions || !emotion_inspect || !userId) {
    return res.status(400).json({ code: 400, message: '缺少必要参数' });
  }
  
  try {
    // 获取记录，获取职位描述
    const record = await InterviewRecord.findOne({
      where: { id: parseInt(id), user_id: userId }
    });
    
    if (!record) {
      return res.status(404).json({ code: 404, message: '记录不存在' });
    }
    
    // 更新状态为 analyzing
    await InterviewRecord.update({
      solve_questions_json: JSON.stringify(solve_questions),
      emotion_inspect: JSON.stringify(emotion_inspect),
      state: 'analyzing',
      updated_at: new Date()
    }, {
      where: { id: parseInt(id), user_id: userId }
    });
    
    // 立即返回成功响应
    res.json({
      code: 200,
      message: '面试已完成，后台开始AI分析',
      data: { id: parseInt(id), state: 'analyzing' }
    });
    
    // 后台异步启动AI分析
    setTimeout(async () => {
      try {
        await processInterviewAnalysis(
          parseInt(id),
          userId,
          record.job_description,
          solve_questions,
          emotion_inspect
        );
      } catch (error) {
        console.error(`[后台错误] 分析面试记录 ${id} 失败:`, error);
      }
    }, 100);
    
  } catch (error) {
    console.error('完成面试失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 上传情绪照片
router.post('/:id/emotion/upload', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { emotion } = req.body;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ code: 400, message: '请选择图片文件' });
  }
  
  try {
    const record = await InterviewRecord.findByPk(parseInt(id));
    if (!record || record.state !== 'pending') {
      return res.status(404).json({ code: 404, message: '记录不存在或状态不正确' });
    }
    
    let snapshots = [];
    try {
      snapshots = JSON.parse(record.emotion_snapshots || '[]');
    } catch (e) {}
    
    const relativePath = `/uploads/emotionImg/${file.filename}`;
    snapshots.push({
      id: Date.now(),
      filename: file.filename,
      fileUrl: relativePath,
      emotion: emotion || 'unknown',
      timestamp: Date.now()
    });
    
    await record.update({
      emotion_snapshots: JSON.stringify(snapshots),
      updated_at: new Date()
    });
    
    res.json({
      code: 200,
      message: '上传成功',
      data: { fileUrl: relativePath, totalSnapshots: snapshots.length }
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取面试记录详情
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId;
  
  try {
    const where = { id: parseInt(id) };
    if (userId) where.user_id = parseInt(userId);
    
    const record = await InterviewRecord.findOne({ where });
    
    if (!record) {
      return res.status(404).json({ code: 404, message: '记录不存在' });
    }
    
    let solveQuestions = null;
    let emotionInspect = null;
    let snapshots = [];
    let analysisResult = null;
    
    try { solveQuestions = JSON.parse(record.solve_questions_json || 'null'); } catch(e) {}
    try { emotionInspect = JSON.parse(record.emotion_inspect || 'null'); } catch(e) {}
    try { snapshots = JSON.parse(record.emotion_snapshots || '[]'); } catch(e) {}
    try { analysisResult = JSON.parse(record.analysis_result || 'null'); } catch(e) {}
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        id: record.id,
        userId: record.user_id,
        jobDescription: record.job_description,
        solveQuestions,
        emotionInspect,
        snapshots,
        analysisResult,
        state: record.state,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      }
    });
  } catch (error) {
    console.error('获取失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取用户面试记录列表
router.get('/user/:userId/list', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, state } = req.query;
  
  try {
    const where = { user_id: parseInt(userId) };
    if (state) where.state = state;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows } = await InterviewRecord.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    const records = rows.map(record => {
      let analysis = null;
      try { analysis = JSON.parse(record.analysis_result || 'null'); } catch(e) {}
      
      return {
        id: record.id,
        jobDescription: record.job_description,
        state: record.state,
        score: analysis?.overall_score || null,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      };
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: { records, total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('获取列表失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 保存AI分析结果
router.post('/:id/analysis', async (req, res) => {
  const { id } = req.params;
  const { analysis_result } = req.body;
  
  if (!analysis_result) {
    return res.status(400).json({ code: 400, message: '缺少分析结果' });
  }
  
  try {
    await InterviewRecord.update({
      analysis_result: JSON.stringify(analysis_result),
      state: 'completed',
      updated_at: new Date()
    }, {
      where: { id: parseInt(id), state: 'analyzing' }
    });
    
    // 分析完成后删除面试准备记录
    const record = await InterviewRecord.findByPk(parseInt(id));
    if (record) {
      await InterviewPreparation.destroy({ where: { user_id: record.user_id } });
    }
    
    res.json({ code: 200, message: '分析结果保存成功' });
  } catch (error) {
    console.error('保存分析失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;