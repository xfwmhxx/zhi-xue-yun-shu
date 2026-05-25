const { UserModuleDailyPerformance } = require('../models');
const { getChinaDate } = require('./dateUtil');

/**
 * 记录模块每日表现
 * @param {Object} params
 * @param {number} params.userId - 用户ID
 * @param {string} params.moduleType - 模块类型 (quiz/unity/interview/read)
 * @param {Object} params.statData - 统计数据 { correct, error, total_score? }
 * @param {Array} params.relatedIds - 相关ID数组
 * @param {Array} params.reducePoints - 弱点知识点ID数组
 */
const recordModulePerformance = async ({ userId, moduleType, statData, relatedIds = [], reducePoints = [] }) => {
  const studyDate = getChinaDate();
  
  try {
    // 查找当日记录
    let record = await UserModuleDailyPerformance.findOne({
      where: {
        user_id: userId,
        module_type: moduleType,
        study_date: studyDate
      }
    });
    
    if (!record) {
      // 创建新记录
      record = await UserModuleDailyPerformance.create({
        user_id: userId,
        module_type: moduleType,
        study_date: studyDate,
        stat_data: JSON.stringify(statData),
        related_ids: JSON.stringify(relatedIds),
        reduce_points: JSON.stringify(reducePoints)
      });
    } else {
      // 更新已有记录：累加统计数据，合并相关ID和弱点
      const existingStat = JSON.parse(record.stat_data || '{}');
      const existingRelated = JSON.parse(record.related_ids || '[]');
      const existingReduce = JSON.parse(record.reduce_points || '[]');
      
      const newStat = {
        correct: (existingStat.correct || 0) + (statData.correct || 0),
        error: (existingStat.error || 0) + (statData.error || 0),
        total_score: (existingStat.total_score || 0) + (statData.total_score || 0)
      };
      
      const newRelated = [...new Set([...existingRelated, ...relatedIds])];
      const newReduce = [...new Set([...existingReduce, ...reducePoints])];
      
      await record.update({
        stat_data: JSON.stringify(newStat),
        related_ids: JSON.stringify(newRelated),
        reduce_points: JSON.stringify(newReduce)
      });
    }
    
    return record;
  } catch (error) {
    console.error('记录模块表现失败:', error);
    throw error;
  }
};

/**
 * 获取用户某天的模块表现
 */
const getUserModulePerformance = async (userId, studyDate, moduleType) => {
  const where = { user_id: userId, study_date: studyDate };
  if (moduleType) where.module_type = moduleType;
  
  return await UserModuleDailyPerformance.findAll({ where });
};

module.exports = {
  recordModulePerformance,
  getUserModulePerformance
};