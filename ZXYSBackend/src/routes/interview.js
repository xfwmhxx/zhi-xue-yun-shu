const express = require('express');
const router = express.Router();
const { InterviewPreparation, User } = require('../models');
const { createAIChat } = require('../utils/AI/aiFactory');

// 讯飞配置（如果直接用讯飞）
const { createSparkChat } = require('../utils/AI/iflytek');

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

// 构建简历摘要
function buildResumeSummary(resumeData) {
  if (!resumeData) return "用户简历信息不完整";
  
  let summary = `姓名：${resumeData.name || '未填写'}\n`;
  summary += `座右铭：${resumeData.motto || '未填写'}\n`;
  
  if (resumeData.contact) {
    summary += `联系方式：邮箱 ${resumeData.contact.email || '未填写'}`;
    if (resumeData.contact.phone) summary += `，电话 ${resumeData.contact.phone}`;
    if (resumeData.contact.location) summary += `，地址 ${resumeData.contact.location}`;
    summary += '\n';
  }
  
  if (resumeData.sections && Array.isArray(resumeData.sections)) {
    summary += "简历内容摘要：\n";
    resumeData.sections.forEach((section) => {
      summary += `\n${section.title || '未命名模块'}：\n`;
      
      if (section.layout === 'list' && Array.isArray(section.items)) {
        section.items.forEach((item) => {
          if (item && item.trim()) {
            summary += `  • ${item}\n`;
          }
        });
      } else if (section.layout === 'timeline' && Array.isArray(section.items)) {
        section.items.forEach((item) => {
          if (item && (item.main || item.sub || item.date || item.desc)) {
            summary += `  • ${item.main || ''} ${item.sub ? `(${item.sub})` : ''}`;
            summary += item.date ? ` [${item.date}]` : '';
            summary += item.desc ? `: ${item.desc}` : '';
            summary += '\n';
          }
        });
      }
    });
  }
  
  return summary;
}

// 构建提示词
function buildPrompt(resumeSummary, userName, jobTitle) {
  return `
# 任务背景
我有一个用户的信息如下：

## 用户简历信息
${resumeSummary}

## 任务要求
你是一位拥有30年临床经验的中医专家，同时担任顶级中医院的招聘面试官。请根据以上用户的简历信息，为我设计 3 - 4 道针对【${jobTitle}】职位的中医求职面试题。

# 具体要求
1. **覆盖维度**：题目需涵盖以下维度：
   - 中医基础理论
   - 辨证论治能力（包含详细主诉、现病史、舌脉象的临床案例）
   - 医患沟通技巧
   - 对中医现代化的看法

2. **案例分析要求**：如果是案例分析题，应聘者需给出：
   - 中医诊断
   - 辨证
   - 治法
   - 代表方剂
   - 药味加减

3. **格式要求**：必须直接输出 JSON 数组格式，严禁包含任何 Markdown 代码块标识。

4. **字段定义**：JSON 数组中的每个对象的 Key 必须固定为以下四个：
   - type (题目类型)
   - content (题目内容)
   - key_points (考察要点)
   - answer_logic (标准答案要点/满分回答逻辑)

5. **语言要求**：JSON 的 Value 必须使用中文，题目要有口头化性质。

6. **个性定制**：请参考用户的简历信息，如果简历中有特定技能、教育背景或研习经历，可以适当设计相关题目。

7. **难度分级**：题目难度应符合【${jobTitle}】职位的要求。

# 输出格式示例
[
  {
    "type": "临床案例分析",
    "content": "患者，女，45岁，主诉：反复胃脘胀痛3年，加重1周...",
    "key_points": "辨证论治能力、方剂运用、临床思维",
    "answer_logic": "1. 诊断：胃痛（肝胃不和证）；2. 辨证：肝气郁结，横逆犯胃..."
  }
]

现在请开始设计 3 - 4 道面试题，要求全部出理论题，不要出那种让用户看什么舌苔脉象的题目 因为网页端用户看不到：
`;
}

// 生成面试题接口
router.post('/generate', async (req, res) => {
  const { user_id, job_title } = req.body;
  console.log('开始生成面试题')

  if (!user_id) {
    return res.status(400).json({ code: 400, message: '用户ID不能为空' });
  }
  if (!job_title) {
    return res.status(400).json({ code: 400, message: '职位名称不能为空' });
  }

  try {
    // 1. 获取用户简历（从 user_resumes 表）
    const { UserResume } = require('../models');
    const userResume = await UserResume.findOne({ where: { user_id } });
    
    if (!userResume) {
      return res.status(400).json({ code: 400, message: '请先完善简历' });
    }

    let resumeData;
    try {
      resumeData = JSON.parse(userResume.resume_data);
    } catch (e) {
      return res.status(500).json({ code: 500, message: '简历数据解析失败' });
    }

    const userName = resumeData.name || '该用户';
    const resumeSummary = buildResumeSummary(resumeData);
    const prompt = buildPrompt(resumeSummary, userName, job_title);

    // 2. 调用AI生成面试题
    const MAX_RETRIES = 3;
    let lastError = null;
    let questions = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const spark = createSparkChat(sparkConfig);
        const systemInstruction = "\n\n重要要求：请务必只返回纯 JSON 格式的字符串，不要包含任何解释、前缀、后缀或 Markdown 代码块标签。";
        const rawResponse = await spark.sendMessage(prompt + systemInstruction);
        console.log(rawResponse)
        const jsonData = tryParseJson(rawResponse);

        if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
          questions = jsonData;
          break;
        } else {
          lastError = new Error('AI 返回的内容格式不正确');
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (!questions) {
      return res.status(500).json({ code: 500, message: '生成面试题失败，请稍后重试' });
    }

    // 3. 保存到数据库
    const questionsJson = JSON.stringify(questions);
    
    const [record, created] = await InterviewPreparation.upsert({
      user_id: user_id,
      job_description: job_title,
      questions_json: questionsJson
    });

    res.json({
      code: 200,
      message: created ? '面试题生成成功' : '面试题更新成功',
      data: {
        id: record.id,
        questions: questions,
        questionCount: questions.length
      }
    });

  } catch (error) {
    console.error('生成面试题异常:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取用户已生成的面试题
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({ code: 400, message: '用户ID格式不正确' });
  }

  try {
    const record = await InterviewPreparation.findOne({
      where: { user_id: parseInt(userId) },
      order: [['created_at', 'DESC']]
    });

    if (!record) {
      return res.status(404).json({ code: 404, message: '暂无面试准备记录' });
    }

    let questions = [];
    try {
      questions = JSON.parse(record.questions_json);
    } catch (e) {
      return res.status(500).json({ code: 500, message: '面试题数据解析失败' });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        id: record.id,
        userId: record.user_id,
        jobDescription: record.job_description,
        questions: questions,
        questionCount: questions.length,
        createdAt: record.created_at
      }
    });
  } catch (error) {
    console.error('获取面试题失败:', error);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

// 删除用户的面试准备记录
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({ code: 400, message: '用户ID格式不正确' });
  }

  try {
    const deleted = await InterviewPreparation.destroy({
      where: { user_id: parseInt(userId) }
    });

    if (deleted === 0) {
      return res.status(404).json({ code: 404, message: '记录不存在' });
    }

    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({ code: 500, message: '删除失败' });
  }
});

module.exports = router;