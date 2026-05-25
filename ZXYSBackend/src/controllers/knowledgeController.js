const { KnowledgePoint, KnowledgeRelation, UserMastery, UserKpDailyFloat,Op, sequelize } = require('../models');

const { recordDailyFloat, batchRecordDailyFloat, getUserFloatStats: getDailyFloatStatsUtil  } = require('../utils/dailyFloatUtil');

const { getUserModulePerformance } = require('../utils/modulePerformanceUtil');
const { recordModulePerformance } = require('../utils/modulePerformanceUtil');
  const { UserDailyTask } = require('../models');
  const { getChinaDate } = require('../utils/dateUtil');

// 获取所有知识点列表
const getAllPoints = async (req, res) => {
  try {
    const { type, page = 1, limit = 100 } = req.query;
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await KnowledgePoint.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']]
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        list: rows
      }
    });
  } catch (error) {
    console.error('获取知识点列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取单个知识点详情（包含关联关系）
const getPointById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const point = await KnowledgePoint.findByPk(id);
    if (!point) {
      return res.status(404).json({ code: 404, message: '知识点不存在' });
    }
    
    // 获取出边关系（该知识点指向其他知识点）
    const outgoing = await KnowledgeRelation.findAll({
      where: { source_id: id },
      include: [
        {
          model: KnowledgePoint,
          as: 'target',
          attributes: ['id', 'name', 'type', 'description']
        }
      ]
    });
    
    // 获取入边关系（其他知识点指向该知识点）
    const incoming = await KnowledgeRelation.findAll({
      where: { target_id: id },
      include: [
        {
          model: KnowledgePoint,
          as: 'source',
          attributes: ['id', 'name', 'type', 'description']
        }
      ]
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...point.toJSON(),
        relations: {
          outgoing: outgoing.map(r => ({
            relation: r.relation,
            target: r.target
          })),
          incoming: incoming.map(r => ({
            relation: r.relation,
            source: r.source
          }))
        }
      }
    });
  } catch (error) {
    console.error('获取知识点详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取完整知识图谱（节点+边）
const getFullGraph = async (req, res) => {
  try {
    // 获取所有节点
    const nodes = await KnowledgePoint.findAll({
      attributes: ['id', 'name', 'type', 'description']
    });
    
    // 获取所有边
    const edges = await KnowledgeRelation.findAll({
      attributes: ['source_id', 'target_id', 'relation']
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        nodes: nodes,
        edges: edges
      }
    });
  } catch (error) {
    console.error('获取知识图谱失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取某个知识点的关联知识点
const getRelationsByPoint = async (req, res) => {
  try {
    const { pointId } = req.params;
    
    const relations = await KnowledgeRelation.findAll({
      where: {
        [Op.or]: [
          { source_id: pointId },
          { target_id: pointId }
        ]
      },
      include: [
        {
          model: KnowledgePoint,
          as: 'source',
          attributes: ['id', 'name', 'type']
        },
        {
          model: KnowledgePoint,
          as: 'target',
          attributes: ['id', 'name', 'type']
        }
      ]
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: relations
    });
  } catch (error) {
    console.error('获取关联知识点失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取用户所有知识点掌握度
const getUserMastery = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const mastery = await UserMastery.findAll({
      where: { user_id: userId },
      include: [
        {
          model: KnowledgePoint,
          as: 'KnowledgePoint',
          attributes: ['id', 'name', 'type', 'description']
        }
      ]
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: mastery
    });
  } catch (error) {
    console.error('获取用户掌握度失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取用户对单个知识点的掌握度
const getPointMastery = async (req, res) => {
  try {
    const { userId, pointId } = req.params;
    
    let mastery = await UserMastery.findOne({
      where: { user_id: userId, point_id: pointId }
    });
    
    if (!mastery) {
      // 如果没有记录，返回默认值
      return res.json({
        code: 200,
        message: '获取成功',
        data: {
          user_id: parseInt(userId),
          point_id: parseInt(pointId),
          mastery_score: 0,
          error_count: 0,
          last_update: null
        }
      });
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: mastery
    });
  } catch (error) {
    console.error('获取知识点掌握度失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 更新掌握度（答题后调用）
const updateMastery = async (req, res) => {
  try {
    const { user_id, point_id, problem_id, is_correct } = req.body;
    
    if (!user_id || !point_id || is_correct === undefined) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    // 查找或创建掌握度记录
    let mastery = await UserMastery.findOne({
      where: { user_id, point_id }
    });
    
    if (!mastery) {
      mastery = await UserMastery.create({
        user_id,
        point_id,
        mastery_score: 0,
        error_count: 0
      });
    }
    
    // 更新掌握度分数
    let newScore = mastery.mastery_score;
    let newErrorCount = mastery.error_count;
    
    if (is_correct) {
      newScore = Math.min(1.0, newScore + 0.1);
    } else {
      newScore = Math.max(0, newScore - 0.05);
      newErrorCount += 1;
    }
    
    await mastery.update({
      mastery_score: newScore,
      error_count: newErrorCount,
      last_update: new Date()
    });

    // 记录每日浮动
    const delta = is_correct ? 0.1 : -0.05;
    await recordDailyFloat(user_id, point_id, delta);

    // 记录模块表现
    try {
      await recordModulePerformance({
        userId: user_id,
        moduleType: 'quiz',
        statData: {
          correct: is_correct ? 1 : 0,
          error: is_correct ? 0 : 1,
          total_score: 0
        },
        relatedIds: (!is_correct && problem_id) ? [problem_id] : [], 
        reducePoints: is_correct ? [] : [point_id]
      });
    } catch (err) {
      console.error('记录单题模块表现失败:', err);
    }
    
    // ========== 更新每日任务进度 ==========
    try {
      
      const today = getChinaDate();
      
      const tasks = await UserDailyTask.findAll({
        where: {
          user_id: user_id,
          task_type: 'quiz',
          status: 0,
          generated_date: today
        }
      });
      
      for (const task of tasks) {
        const newValue = task.current_value + 1;
        const newStatus = newValue >= task.goal_value ? 1 : 0;
        
        await task.update({
          current_value: newValue,
          status: newStatus
        });
        
        if (newStatus === 1) {
          console.log(`✅ 用户 ${user_id} 的任务"${task.task_name}"已完成！`);
        }
      }
    } catch (err) {
      console.error('更新任务进度失败:', err);
    }
    // 获取知识点名称
    const point = await KnowledgePoint.findByPk(point_id, {
      attributes: ['name']
    });
    
    res.json({
      code: 200,
      message: '更新成功',
      data: {
        mastery_score: newScore,
        error_count: newErrorCount,
        improvement: is_correct ? '0.1' : '-0.05',
        point_name: point ? point.name : `知识点${point_id}` 
      }
    });
  } catch (error) {
    console.error('更新掌握度失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 批量更新掌握度（一次答题可能涉及多个知识点）
const batchUpdateMastery = async (req, res) => {
  try {
    const { user_id, results } = req.body;
    
    if (!user_id || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    const updateResults = [];
    const dailyFloatUpdates = [];  // 收集每日浮动更新
    
    for (const item of results) {
      const { point_id, is_correct } = item;
      
      let mastery = await UserMastery.findOne({
        where: { user_id, point_id }
      });
      
      if (!mastery) {
        mastery = await UserMastery.create({
          user_id,
          point_id,
          mastery_score: 0,
          error_count: 0
        });
      }
      
      let newScore = mastery.mastery_score;
      let newErrorCount = mastery.error_count;
      
      if (is_correct) {
        newScore = Math.min(1.0, newScore + 0.1);
      } else {
        newScore = Math.max(0, newScore - 0.05);
        newErrorCount += 1;
      }
      
      await mastery.update({
        mastery_score: newScore,
        error_count: newErrorCount,
        last_update: new Date()
      });

      // 收集每日浮动更新
      const delta = is_correct ? 0.1 : -0.05;
      dailyFloatUpdates.push({ kpId: point_id, delta });
      
      updateResults.push({
        point_id,
        mastery_score: newScore,
        error_count: newErrorCount
      });
    }

        // 批量记录每日浮动
    await batchRecordDailyFloat(user_id, dailyFloatUpdates);
    
    res.json({
      code: 200,
      message: '批量更新成功',
      data: updateResults
    });
  } catch (error) {
    console.error('批量更新掌握度失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 根据用户类型随机获取知识点
const getRandomPoints = async (req, res) => {
  try {
    const { userType, count = 5 } = req.query;
    
    let whereCondition = {};
    
    // 根据用户类型决定知识点类型偏好
    if (parseInt(userType) === 2) {
      // 中医学者：理论+方剂+病机，难度更高
      whereCondition = { type: { [Op.in]: [1, 2, 4] } };
    } else if (parseInt(userType) === 3) {
      // 中医求职者：理论+方剂，偏向实用
      whereCondition = { type: { [Op.in]: [1, 2] } };
    } else {
      // 通识者：基础理论为主
      whereCondition = { type: { [Op.in]: [1] } };
    }
    
    // 随机获取知识点
    const points = await KnowledgePoint.findAll({
      where: whereCondition,
      order: sequelize.random(),
      limit: parseInt(count)
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: points
    });
  } catch (error) {
    console.error('获取随机知识点失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 摸底测试批量更新掌握度（只加分）
const batchUpdateMasteryOnlyAdd = async (req, res) => {
  try {
    const { user_id, results } = req.body;
    
    if (!user_id || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    const updateResults = [];
    
    for (const item of results) {
      const { point_id, is_correct } = item;
      
      // 只处理答对的题目
      if (!is_correct) {
        updateResults.push({
          point_id,
          mastered: false,
          mastery_score: 0
        });
        continue;
      }
      
      let mastery = await UserMastery.findOne({
        where: { user_id, point_id }
      });
      
      let newScore = 0;
      
      if (!mastery) {
        // 没有记录，创建新记录，答对得0.2分
        newScore = 0.2;
        mastery = await UserMastery.create({
          user_id,
          point_id,
          mastery_score: newScore,
          error_count: 0
        });
      } else {
        // 有记录，只加分，不减分，每次答对加0.1，最高1.0
        newScore = Math.min(1.0, mastery.mastery_score + 0.1);
        await mastery.update({
          mastery_score: newScore,
          last_update: new Date()
        });
      }
      
      updateResults.push({
        point_id,
        mastered: true,
        mastery_score: newScore
      });
    }
    
    res.json({
      code: 200,
      message: '更新成功',
      data: updateResults
    });
  } catch (error) {
    console.error('批量更新掌握度失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取今日所有知识点的浮动详情（用于日志列表）
const getTodayKpDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { getChinaDate } = require('../utils/dateUtil');
    
    const today = getChinaDate();
    
    const records = await UserKpDailyFloat.findAll({
      where: { user_id: userId, study_date: today },
      include: [
        {
          model: KnowledgePoint,
          attributes: ['id', 'name', 'type']
        }
      ],
      order: [['float_value', 'DESC']]
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: records
    });
  } catch (error) {
    console.error('获取今日知识点详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取用户今日学习活跃度
const getTodayActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { getChinaDate } = require('../utils/dateUtil');
    const { getUserDailyActivity } = require('../utils/dailyFloatUtil');
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '缺少用户ID' });
    }
    
    const today = getChinaDate();
    const activityCount = await getUserDailyActivity(parseInt(userId), today);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        date: today,
        total_interactions: activityCount
      }
    });
  } catch (error) {
    console.error('获取今日活跃度失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取用户某段时间内的知识点浮动统计
const getUserFloatStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    // 使用重命名后的函数
    const result = await getDailyFloatStatsUtil(parseInt(userId), startDate, endDate);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error) {
    console.error('获取浮动统计失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};



// 获取用户模块表现
const getModulePerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, moduleType } = req.query;
    
    if (!userId || !date) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    
    const result = await getUserModulePerformance(parseInt(userId), date, moduleType);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error) {
    console.error('获取模块表现失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};


module.exports = {
  getAllPoints,
  getPointById,
  getFullGraph,
  getRandomPoints,
  getRelationsByPoint,
  getUserMastery,
  getPointMastery,
  updateMastery,
  batchUpdateMastery,
  batchUpdateMasteryOnlyAdd,
  getTodayActivity,
  getTodayKpDetails,
  getUserFloatStats,
  getModulePerformance
};