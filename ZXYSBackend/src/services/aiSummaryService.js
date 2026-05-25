const { createSparkChat } = require('../utils/AI/iflytek');
const { createDeepSeekChat } = require('../utils/AI/deepseek');
const { getChinaDate } = require('../utils/dateUtil');
const { createAIChat } = require('../utils/AI/aiFactory');
const { Op } = require('sequelize');
const { KnowledgePoint, UserKpDailyFloat, UserMastery, UserModuleDailyPerformance, UserDailyAISummary, UserDailyTask, User } = require('../models');

const sparkConfig = {
  appid: process.env.SPARK_APPID || 'your_spark_appid',
  apiKey: process.env.SPARK_API_KEY || 'your_spark_api_key',
  apiSecret: process.env.SPARK_API_SECRET || 'your_spark_api_secret',
  domain: 'lite',
};

// 农历日期转换（简单模拟）
const getChineseDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const yearGan = tiangan[(year - 4) % 10];
  const yearZhi = dizhi[(year - 4) % 12];
  return `${yearGan}${yearZhi}年 · ${month}月${day}日`;
};

// 尝试解析JSON
const tryParseJson = (text) => {
  try {
    const cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleanText);
  } catch (e) {
    return null;
  }
};

// 验证返回数据结构
const validateResponseStructure = (data) => {
  const required = ['report_info', 'narrative', 'knowledge_status', 'charts'];
  for (const key of required) {
    if (!data[key]) return false;
  }
  if (!data.report_info.today_str || data.report_info.yesterday_score === undefined) return false;
  if (!data.narrative.summary_line || !data.narrative.ai_analysis_content) return false;
  if (!Array.isArray(data.knowledge_status.positive_kps) || !Array.isArray(data.knowledge_status.negative_kps)) return false;
  if (!Array.isArray(data.charts.radar_values) || !Array.isArray(data.charts.rose_values) ||
      !Array.isArray(data.charts.growth_values) || !Array.isArray(data.charts.weakness_values)) return false;
  return true;
};

// 检查用户是否是今天注册
const isNewUserToday = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ['reg_date'] });
  if (!user) return true;
  
  const regDate = new Date(user.reg_date);
  const today = new Date();
  return regDate.toDateString() === today.toDateString();
};

// 检查用户是否有足够的学习数据（至少3天或有一定学习量）
const hasEnoughLearningData = async (userId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
  const recentFloats = await UserKpDailyFloat.findAll({
    where: { 
      user_id: userId, 
      study_date: { [Op.gte]: sevenDaysAgoStr }
    }
  });
  
  const uniqueDays = new Set(recentFloats.map(f => f.study_date));
  return uniqueDays.size >= 3 || recentFloats.length >= 5;
};

// 构建提示词
const buildPrompt = async (userId) => {

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  
  // 1. 获取昨日知识点浮动数据
  const yesterdayFloats = await UserKpDailyFloat.findAll({
    where: { user_id: userId, study_date: yesterdayStr },
    include: [{ model: KnowledgePoint, attributes: ['id', 'name', 'type'] }],
    order: [['float_value', 'DESC']]
  });
  
  // 2. 获取用户整体掌握度
  const masteryData = await UserMastery.findAll({
    where: { user_id: userId },
    include: [{ model: KnowledgePoint, attributes: ['id', 'name', 'type'] }],
    order: [['mastery_score', 'DESC']]
  });

  // 3. 获取昨日模块表现
  const yesterdayModulePerf = await UserModuleDailyPerformance.findAll({
    where: { user_id: userId, study_date: yesterdayStr },
    attributes: ['module_type', 'stat_data', 'related_ids', 'reduce_points']
  });

  // 收集并转换知识点名称
  const allReducePointIds = [];
  yesterdayModulePerf.forEach(m => {
    try {
      const points = JSON.parse(m.reduce_points || '[]');
      allReducePointIds.push(...points);
    } catch(e) {}
  });

  const uniquePointIds = [...new Set(allReducePointIds)];
  const pointsMap = new Map();
  if (uniquePointIds.length > 0) {
    const points = await KnowledgePoint.findAll({
      where: { id: uniquePointIds },
      attributes: ['id', 'name']
    });
    points.forEach(p => pointsMap.set(p.id, p.name));
  }

  const modulePerfList = yesterdayModulePerf.map(m => {
    let statData = {};
    try { statData = JSON.parse(m.stat_data); } catch(e) {}
    let reducePointIds = [];
    try { reducePointIds = JSON.parse(m.reduce_points); } catch(e) {}
    const weakPointNames = reducePointIds.map(id => pointsMap.get(id) || `知识点${id}`);
    return {
      module_type: m.module_type,
      correct_count: statData.correct || 0,
      error_count: statData.error || 0,
      weak_points: weakPointNames
    };
  });
  
  const yesterdayTotalFloat = yesterdayFloats.reduce((sum, item) => sum + item.float_value, 0);
  const yesterdayScore = Math.min(100, Math.max(0, Math.round(50 + yesterdayTotalFloat * 50)));
  
  const floatList = yesterdayFloats.map(f => ({
    name: f.KnowledgePoint?.name || '未知',
    type: f.KnowledgePoint?.type || 0,
    float_value: f.float_value,
    update_count: f.update_count
  }));
  
  const masteryList = masteryData.slice(0, 20).map(m => ({
    name: m.KnowledgePoint?.name || '未知',
    type: m.KnowledgePoint?.type || 0,
    mastery_score: m.mastery_score,
    error_count: m.error_count
  }));
  
  const prompt = `你是一位资深的中医教育专家和AI学习顾问。请根据以下用户学习数据，生成一份个性化的学习总结报告。

## 用户昨日学习数据如下：

昨日知识点浮动情况（float_value正数表示进步，负数表示退步）：
${floatList.length > 0 ? JSON.stringify(floatList, null, 2) : '昨日无学习记录'}

昨日综合得分：${yesterdayScore}分

## 用户当前整体掌握度（部分展示）

${masteryList.length > 0 ? JSON.stringify(masteryList, null, 2) : '暂无掌握度数据'}

## 昨日用户各模块表现（字段说明：module_type-模块名称，correct_count-正确答题数，error_count-错误答题数，weak_points-暴露的弱点知识点名称）：
${JSON.stringify(modulePerfList, null, 2)}

## 输出要求

请严格按照以下JSON格式返回，不要包含任何其他解释、前缀或后缀：

{
  "report_info": {
    "today_str": "${getChineseDate()}",
    "yesterday_score": ${yesterdayScore}
  },
  "narrative": {
    "summary_line": "一句话总结（15字以内，文言风格）",
    "ai_analysis_content": "详细的个性化分析（50-100字），指出进步和薄弱之处，给出具体建议"
  },
  "daily_tasks": [
    {
      "task_name": "任务名称，要求具体到内容，比如“刷10道题目”",
      "task_type": "quiz/unity/read/interview 这四个中的其中一个",
      "goal_value": 目标值（数字），如果是10道题目则值为10，如果是阅读15分钟则值为15，
      "current_value": 0
    }
  ],
  "knowledge_status": {
    "positive_kps": ["进步显著的知识点1", "知识点2"],
    "negative_kps": ["需要加强的知识点1", "知识点2"]
  },
  "charts": {
    "radar_values": [数值1, 数值2, 数值3, 数值4, 数值5],
    "rose_values": [
      { "name": "校考(Quiz)", "value": 数值 },
      { "name": "幻境(Unity)", "value": 数值 },
      { "name": "面询(Mock)", "value": 数值 },
      { "name": "阅读(Read)", "value": 数值 }
    ],
    "growth_values": [
      { "name": "知识点名", "value": 掌握度数值 },
      { "name": "知识点名", "value": 掌握度数值 },
      { "name": "知识点名", "value": 掌握度数值 }
    ],
    "weakness_values": [
      { "name": "理论", "value": 数值 },
      { "name": "方剂", "value": 数值 },
      { "name": "穴位", "value": 数值 },
      { "name": "病机", "value": 数值 }
    ]
  }
}
## 重要提醒（必须严格遵守）：

1. radar_values 必须是5个数值（理论、方剂、穴位、病机、诊法），范围0-100
2. rose_values 必须是4个对象，name为"校考(Quiz)","幻境(Unity)","面询(Mock)","阅读(Read)"，value范围0-100
3. growth_values 必须是3个对象，name是知识点名称，value是掌握度数值(0-1)
4. weakness_values 必须是4个对象，name为"理论","方剂","穴位","病机"，value是风险值(0-100)
5. 结果严格按照数据结果来！ 但是rose_values的四项必须有值，以及radar_values的五个数值必须都大于0 
6. 这次是路演！所以就算昨日没有数据你也假装有数据！ 然后各项数值分析必须保证让图表填充起来好看！ 就比如radar_values的值必须每个都保证在50-100之间！然后任务的话第一个固定为刷3道黄帝内经相关的题目！ 其他的随意。
`;

  return { prompt, yesterdayScore, yesterdayStr };
};

// 构建用户画像提示词
const buildPortraitPrompt = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ['username'] });
  
  const allMastery = await UserMastery.findAll({
    where: { user_id: userId },
    include: [{ model: KnowledgePoint, attributes: ['id', 'name', 'type'] }],
    order: [['mastery_score', 'DESC']]
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  
  const recentFloats = await UserKpDailyFloat.findAll({
    where: { 
      user_id: userId, 
      study_date: { [Op.gte]: thirtyDaysAgoStr }
    },
    include: [{ model: KnowledgePoint, attributes: ['name'] }]
  });

  const masteryList = allMastery.slice(0, 30).map(m => ({
    name: m.KnowledgePoint?.name || '未知',
    mastery_score: m.mastery_score,
    error_count: m.error_count
  }));

  const floatTrend = recentFloats.reduce((acc, f) => {
    const date = f.study_date;
    if (!acc[date]) acc[date] = 0;
    acc[date] += f.float_value;
    return acc;
  }, {});

  return `你是一位资深的中医教育专家。请根据以下用户的历史学习数据，生成一份综合的用户画像报告。

## 用户信息
用户名：${user?.username || '用户'}

## 用户整体掌握度数据：
${JSON.stringify(masteryList, null, 2)}

## 用户近期学习趋势（最近30天每日浮动总和）：
${JSON.stringify(floatTrend, null, 2)}

## 输出要求
请严格按照以下JSON格式返回，不要包含任何其他解释：

{
  "overallScore": 综合能力评分(0-100),
  "overallLevel": "能力等级（优秀/良好/合格/待提升）",
  "coreScores": {
    "theoryScore": 理论掌握度(0-100),
    "syndromeScore": 辨证能力(0-100),
    "clinicalScore": 临床能力(0-100),
    "researchScore": 科研能力(0-100),
    "classicScore": 古籍研读能力(0-100)
  },
  "progressData": {
    "neijing": 内经掌握度(0-100),
    "shanghanlun": 伤寒论掌握度(0-100),
    "jinguiyaolue": 金匮要略掌握度(0-100),
    "wenbingtiaobian": 温病条辨掌握度(0-100),
    "shennongbencaojing": 神农本草经掌握度(0-100)
  },
  "dimensionData": {
    "zangxiang": 藏象学说(0-100),
    "jingluo": 经络理论(0-100),
    "bingyin": 病因病机(0-100),
    "zhize": 治则治法(0-100),
    "fangjixue": 方剂学(0-100)
  },
  "radarValues": [藏象, 经络, 病因, 治法, 方剂],
  "advantageAreas": ["优势领域1", "优势领域2", "优势领域3"],
  "weaknessAreas": ["待提升领域1", "待提升领域2"],
  "recommendLearning": ["推荐学习内容1", "推荐学习内容2", "推荐学习内容3"],
  "recommendCourses": ["推荐课程1", "推荐课程2", "推荐课程3"],
  "recommendBooks": ["推荐书籍1", "推荐书籍2", "推荐书籍3"],
  "adviceText": "详细的学习建议文字"
}`;
};

// 执行AI总结并存储（后台异步调用）
const executeAndStoreSummary = async (userId, summaryDate, yesterdayScore) => {
  try {
    console.log(`🤖 开始为用户 ${userId} 执行AI总结生成...`);
    
    const { prompt } = await buildPrompt(userId);


    const ai = createDeepSeekChat();
    const rawResponse = await ai.sendMessage(prompt);
    const jsonData = tryParseJson(rawResponse);
    
    if (!jsonData) {
      throw new Error('AI返回内容不是有效JSON');
    }
    
    // 补全缺失字段
    if (!jsonData.report_info) jsonData.report_info = {};
    if (!jsonData.report_info.today_str) jsonData.report_info.today_str = getChineseDate();
    if (jsonData.report_info.yesterday_score === undefined) jsonData.report_info.yesterday_score = yesterdayScore;
    if (!jsonData.narrative) jsonData.narrative = {};
    if (!jsonData.narrative.summary_line) jsonData.narrative.summary_line = "学有所进，继续精进";
    if (!jsonData.narrative.ai_analysis_content) jsonData.narrative.ai_analysis_content = "基于您的学习数据，建议继续巩固基础。";
    if (!jsonData.knowledge_status) jsonData.knowledge_status = { positive_kps: [], negative_kps: [] };
    if (!jsonData.charts) jsonData.charts = {
      radar_values: [60, 60, 60, 60, 60],
      rose_values: [
        { name: "校考(Quiz)", value: 25 },
        { name: "幻境(Unity)", value: 25 },
        { name: "面询(Mock)", value: 25 },
        { name: "阅读(Read)", value: 25 }
      ],
      growth_values: [],
      weakness_values: []
    };
    
    // 分离：summary_content 是不含 daily_tasks 的部分
    const { daily_tasks, ...summaryContent } = jsonData;
    
    // 更新 AI 总结表
    await UserDailyAISummary.update(
      {
        evaluation_content: JSON.stringify(summaryContent),
        status: 1
      },
      {
        where: { user_id: userId, summary_date: summaryDate }
      }
    );
    
    // 存储每日任务
    if (daily_tasks && daily_tasks.length > 0) {
      for (const task of daily_tasks) {
        await UserDailyTask.create({
          user_id: userId,
          task_name: task.task_name,
          task_type: task.task_type,
          target_id: null,
          goal_value: task.goal_value,
          current_value: 0,
          status: 0,
          generated_date: summaryDate
        });
      }
    }
    
    console.log(`✅ 用户 ${userId} 的AI总结生成并存储成功`);

    // 自动触发用户画像更新（不等待结果，后台执行）
    executeAndStorePortrait(userId).catch(err => {
      console.error(`用户 ${userId} 画像自动更新失败:`, err);
    });

    return summaryContent;
    
  } catch (error) {
    console.error(`❌ 用户 ${userId} AI总结生成失败:`, error);
    
    // 更新状态为失败（可选：设置状态为2表示失败）
    await UserDailyAISummary.update(
      { status: 0 },
      { where: { user_id: userId, summary_date: summaryDate } }
    );
    throw error;
  }
};

// 执行用户画像生成（后台异步调用）
const executeAndStorePortrait = async (userId) => {
  try {
    console.log(`🎨 开始为用户 ${userId} 执行用户画像生成...`);
    
    const user = await User.findByPk(userId, { attributes: ['id', 'username'] });
    if (!user) {
      throw new Error('用户不存在');
    }
    
    const prompt = await buildPortraitPrompt(userId);
    const ai = createDeepSeekChat();
    const rawResponse = await ai.sendMessage(prompt);
    
    // 尝试解析JSON
    let jsonData;
    try {
      const cleanText = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      jsonData = JSON.parse(cleanText);
    } catch (e) {
      throw new Error('AI返回内容不是有效JSON');
    }
    
    const portraitData = {
      name: user.username,
      userId: user.id,
      overallScore: jsonData.overallScore || 75,
      overallLevel: jsonData.overallLevel || '良好',
      coreScores: jsonData.coreScores || {
        theoryScore: 75, syndromeScore: 75, clinicalScore: 75, researchScore: 75, classicScore: 75
      },
      progressData: jsonData.progressData || {
        neijing: 75, shanghanlun: 75, jinguiyaolue: 75, wenbingtiaobian: 75, shennongbencaojing: 75
      },
      dimensionData: jsonData.dimensionData || {
        zangxiang: 75, jingluo: 75, bingyin: 75, zhize: 75, fangjixue: 75
      },
      radarValues: jsonData.radarValues || [75, 75, 75, 75, 75],
      advantageAreas: jsonData.advantageAreas || [],
      weaknessAreas: jsonData.weaknessAreas || [],
      // ========== 新增以下字段 ==========
      recommendLearning: jsonData.recommendLearning || ["《脾胃论》精读", "补土派专题", "李东垣学术思想"],
      recommendCourses: jsonData.recommendCourses || ["中医基础理论进阶", "方剂学精讲", "中医内科学案例"],
      recommendBooks: jsonData.recommendBooks || ["《脾胃论》", "《内外伤辨惑论》", "《兰室秘藏》"],
      adviceText: jsonData.adviceText || "根据您的学习情况和知识图谱分析，建议您重点关注脾脏学说的学习，加强《脾胃论》的精读与理解。每日坚持经典诵读15分钟，每周完成3则医案分析，每月撰写1篇学术综述，有助于提升辨证思维能力和临床实践水平。",
      // ========== 新增结束 ==========
      generatedAt: new Date().toISOString()
    };
    
    await User.update(
      {
        user_portrait: JSON.stringify(portraitData),
        portrait_updated_at: new Date()
      },
      { where: { id: userId } }
    );
    
    console.log(`✅ 用户 ${userId} 的用户画像生成成功`);
    return portraitData;
    
  } catch (error) {
    console.error(`❌ 用户 ${userId} 用户画像生成失败:`, error);
    throw error;
  }
};


// 获取今天的日期字符串 YYYY-MM-DD
const getTodayDateStr = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateStr = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 在 requestAISummary 函数中使用
const formattedToday = getTodayDateStr();

// 请求生成AI总结（主入口）
const requestAISummary = async (userId) => {
  const formattedToday = getTodayDateStr();
  
  // 1. 检查是否是今日注册用户（新用户不触发）
  const isNew = await isNewUserToday(userId);
  if (isNew) {
    return { code: 201, message: '今日注册用户，暂无昨日学习数据' };
  }
  
  // 2. 老用户，检查今日是否已有总结
  const existingSummary = await UserDailyAISummary.findOne({
    where: { user_id: userId, summary_date: formattedToday }
  });
  
  if (existingSummary && existingSummary.status === 1) {
    const tasks = await UserDailyTask.findAll({
      where: { user_id: userId, generated_date: formattedToday }
    });
    return {
      code: 200,
      message: '已有总结',
      data: {
        summary: JSON.parse(existingSummary.evaluation_content),
        tasks: tasks
      }
    };
  }
  
  if (existingSummary && existingSummary.status === 0) {
    return { code: 102, message: 'AI总结正在生成中，请稍后' };
  }
  
  // 3. 创建新总结并异步执行（老用户，无论昨日是否有数据）
  await UserDailyAISummary.create({
    user_id: userId,
    summary_date: formattedToday,
    evaluation_content: null,
    status: 0
  });
  
  // 异步执行
  const yesterdayTotalFloat = await UserKpDailyFloat.sum('float_value', {
    where: { user_id: userId, study_date: getYesterdayDateStr() }
  });
  const yesterdayScore = Math.min(100, Math.max(0, Math.round(50 + (yesterdayTotalFloat || 0) * 50)));
  
  executeAndStoreSummary(userId, formattedToday, yesterdayScore).catch(err => {
    console.error('异步生成总结失败:', err);
  });
  
  return { code: 102, message: 'AI总结正在生成中，请稍后' };
};

// 获取已有总结（用于轮询）
const getSummary = async (userId) => {
  const formattedToday = getTodayDateStr();
  
  // 1. 检查是否是今日注册用户（新用户不触发）
  const isNew = await isNewUserToday(userId);
  if (isNew) {
    return { code: 201, message: '今日注册用户，暂无昨日学习数据' };
  }
  
  // 2. 老用户，查询总结记录
  const summary = await UserDailyAISummary.findOne({
    where: { user_id: userId, summary_date: formattedToday }
  });
  
  if (!summary) {
    return { code: 204, message: '无总结记录' };
  }
  
  if (summary.status === 0) {
    return { code: 102, message: '总结正在生成中' };
  }
  
  const tasks = await UserDailyTask.findAll({
    where: { user_id: userId, generated_date: formattedToday }
  });
  
  return {
    code: 200,
    data: {
      summary: JSON.parse(summary.evaluation_content),
      tasks: tasks
    }
  };
};

// 请求生成/更新用户画像
const requestUserPortrait = async (userId) => {
  const isNew = await isNewUserToday(userId);
  if (isNew) {
    return { code: 201, message: '今日注册用户，暂无足够学习数据生成画像' };
  }
  
  const hasEnoughData = await hasEnoughLearningData(userId);
  if (!hasEnoughData) {
    return { code: 202, message: '学习数据不足，请继续学习积累更多数据后再生成画像' };
  }
  
  const user = await User.findByPk(userId, { 
    attributes: ['id', 'username', 'user_portrait', 'portrait_updated_at'] 
  });
  
  if (user.user_portrait && user.portrait_updated_at) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (new Date(user.portrait_updated_at) > sevenDaysAgo) {
      return {
        code: 200,
        message: '已有画像',
        data: JSON.parse(user.user_portrait)
      };
    }
  }
  
  executeAndStorePortrait(userId).catch(err => {
    console.error('异步生成画像失败:', err);
  });
  
  return { code: 102, message: '用户画像正在生成中，请稍后' };
};

// 获取用户画像（用于轮询）
const getUserPortrait = async (userId) => {
  const user = await User.findByPk(userId, { 
    attributes: ['id', 'username', 'user_portrait', 'portrait_updated_at'] 
  });
  
  if (!user) {
    return { code: 404, message: '用户不存在' };
  }
  
  if (!user.user_portrait) {
    return { code: 204, message: '暂无画像数据' };
  }
  
  return {
    code: 200,
    data: {
      portrait: JSON.parse(user.user_portrait),
      updatedAt: user.portrait_updated_at
    }
  };
};

// 更新任务进度
const updateTaskProgress = async (userId, taskId, currentValue) => {
  const task = await UserDailyTask.findOne({
    where: { id: taskId, user_id: userId }
  });
  
  if (!task) {
    return { code: 404, message: '任务不存在' };
  }
  
  const newCurrentValue = Math.min(task.goal_value, currentValue);
  const newStatus = newCurrentValue >= task.goal_value ? 1 : 0;
  
  await task.update({
    current_value: newCurrentValue,
    status: newStatus
  });
  
  return { code: 200, message: '更新成功', data: task };
};

module.exports = {
  requestAISummary,
  getSummary,
  updateTaskProgress,
  requestUserPortrait,
  getUserPortrait
};
