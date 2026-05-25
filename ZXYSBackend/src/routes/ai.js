const express = require('express');
const { createSparkChat } = require('../utils/AI/iflytek');
// ai总结
const { generateAISummary } = require('../services/aiSummaryService');
const { KnowledgePoint } = require('../models');
// AI问答智能体的相关配置
const { buildChatPrompt, parseChatResponse } = require('../utils/AI/chatPrompt');
const { createDeepSeekChat } = require('../utils/AI/deepseek');
const { Op } = require('sequelize');
const router = express.Router();

const sparkConfig = {
  appid: process.env.SPARK_APPID || '3efb053a',
  apiKey: process.env.SPARK_API_KEY || '3d73d5b03ccb0cd8834bb87797c45232',
  apiSecret: process.env.SPARK_API_SECRET || 'MzgzMzMwYWMzYjZlMzhiYmM0OWQ2Njc0',
  domain: 'lite',
};

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

// 根据用户类型获取对应难度/类型的知识点
router.post('/generate-quiz', async (req, res) => {
  const { userType, pointIds } = req.body;

  if (!pointIds || pointIds.length === 0) {
    return res.status(400).json({ code: 400, message: '缺少知识点参数' });
  }

  // 获取知识点详情
  const points = await KnowledgePoint.findAll({
    where: { id: { [Op.in]: pointIds } },
    attributes: ['id', 'name', 'description', 'type']
  });

  if (points.length === 0) {
    return res.status(404).json({ code: 404, message: '未找到知识点' });
  }

  const pointsInfo = points.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description
  }));

  // 根据用户类型定制提示词
  let difficultyHint = '';
  let focusHint = '';
  
  if (userType === 2) {
    difficultyHint = '难度：中等偏上，考察深度理解';
    focusHint = '重点考察知识点的内在联系、临床应用和病机分析';
  } else if (userType === 3) {
    difficultyHint = '难度：中等，考察基础理论和实际应用';
    focusHint = '重点考察基础概念、诊断要点和常用方剂';
  } else {
    difficultyHint = '难度：基础，考察入门知识';
    focusHint = '重点考察基本概念和常识性知识';
  }

  const systemInstruction = `\n\n重要要求：请务必只返回纯 JSON 格式的字符串，不要包含任何解释、前缀、后缀或 Markdown 代码块标签。`;

  const prompt = `你是一位中医考试出题专家。请基于以下知识点生成5道选择题。

知识点列表：
${pointsInfo.map((p, i) => `${i + 1}. 【${p.name}】${p.description || ''}`).join('\n')}

出题要求：
1. ${difficultyHint}
2. ${focusHint}
3. 每题必须包含题干和4个选项，只有1个正确答案，且四个选项不允许有缺少或重复的内容
4. 题目要覆盖上述所有知识点（可以一个知识点出多题）
5. 每道题需要标注对应的知识点ID
6. options只要给选项的内容即可，至于A、B、C、D的标签由前端展示时添加，不要包含在选项内容里

请严格按照以下JSON格式返回：
{
  "questions": [
    {
      "text": "题干内容",
      "options": ["选项A的内容", "选项B的内容", "选项C的内容", "选项D的内容"],
      "correctAnswer": 0,
      "pointId": 对应的知识点ID
    }
  ]
}

注意：correctAnswer 是 0-3 的整数，0表示A，1表示B，2表示C，3表示D。`;

  const finalPrompt = prompt + systemInstruction;
  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const spark = createSparkChat(sparkConfig);
      const rawResponse = await spark.sendMessage(finalPrompt);
      const jsonData = tryParseJson(rawResponse);

      if (jsonData && jsonData.questions && jsonData.questions.length > 0) {
        return res.json({
          code: 200,
          message: '生成成功',
          data: {
            questions: jsonData.questions,
            sourcePoints: pointsInfo
          }
        });
      } else {
        lastError = new Error('AI 返回的内容格式不正确');
      }
    } catch (error) {
      lastError = error;
    }
  }

  res.status(500).json({
    code: 500,
    message: `在 ${MAX_RETRIES} 次尝试后仍无法获得有效的题目`,
    error: lastError?.message
  });
});


// AI学习总结接口
router.post('/summary', async (req, res) => {
  const { user_id } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ code: 400, message: '缺少用户ID' });
  }
  
  try {
    console.log(`🤖 开始为用户 ${user_id} 生成AI学习总结...`);
    
    const summary = await generateAISummary(parseInt(user_id));
    
    // 后端直接 console.log 结果
    console.log('='.repeat(60));
    console.log('📊 AI学习总结报告');
    console.log('='.repeat(60));
    console.log(JSON.stringify(summary, null, 2));
    console.log('='.repeat(60));
    
    res.json({
      code: 200,
      message: '生成成功',
      data: summary
    });
  } catch (error) {
    console.error('生成AI总结失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '生成AI总结失败'
    });
  }
});

// 方剂配伍：中医传统AI分析接口
router.post('/FJPW/analyze', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ code:400, message: 'Prompt is required' });
  }

  const systemInstruction = "\n\n重要要求：请务必只返回纯 JSON 格式的字符串，不要包含任何解释、前缀、后缀或 Markdown 代码块标签。";
  const finalPrompt = prompt + systemInstruction;

  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const spark = createSparkChat(sparkConfig);
      const rawResponse = await spark.sendMessage(finalPrompt);
      const jsonData = tryParseJson(rawResponse);

      if (jsonData !== null) {
        return res.json({
          code:200,
          attempt: attempt,
          data: jsonData
        });
      } else {
        lastError = new Error('AI 返回的内容格式不正确，未能解析为 JSON');
      }
    } catch (error) {
      console.error(`第${attempt}次尝试失败:`, error);
      lastError = error;
    }
  }

  res.status(500).json({
    code:500,
    message: `在 ${MAX_RETRIES} 次尝试后仍无法获得有效的 JSON 响应`,
    error: lastError?.message
  });
});

// 中医问答 + 知识图谱接口
router.post('/chat-qa', async (req, res) => {
  const { question } = req.body;
  
  if (!question || question.trim() === '') {
    return res.status(400).json({ code: 400, message: '问题不能为空' });
  }
  
  console.log(`🌿 收到中医问答请求: ${question}`);
  
  const MAX_RETRIES = 2;
  let lastError = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = buildChatPrompt(question);
      const ai = createDeepSeekChat();
      const rawResponse = await ai.sendMessage(prompt);
      
      const parsedData = parseChatResponse(rawResponse);
      
      if (parsedData) {
        console.log(`✅ 问答成功，图谱包含 ${parsedData.knowledgeGraph.nodes.length} 个节点`);
        return res.json({
          code: 200,
          message: 'success',
          data: parsedData
        });
      } else {
        lastError = new Error('AI返回格式解析失败');
      }
    } catch (error) {
      console.error(`第${attempt}次尝试失败:`, error.message);
      lastError = error;
    }
  }
  
  // 所有重试都失败，返回降级响应
  res.status(500).json({
    code: 500,
    message: 'AI服务暂时不可用，请稍后重试',
    error: lastError?.message
  });
});

module.exports = router;