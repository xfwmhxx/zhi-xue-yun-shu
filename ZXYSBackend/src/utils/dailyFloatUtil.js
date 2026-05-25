const { UserKpDailyFloat, sequelize, Op } = require('../models');
const { getChinaDate, getChinaDateTime } = require('./dateUtil');

/**
 * 记录知识点每日浮动
 */
const recordDailyFloat = async (userId, kpId, delta) => {
  const studyDate = getChinaDate();
  const now = getChinaDateTime();
  
  try {
    let record = await UserKpDailyFloat.findOne({
      where: {
        user_id: userId,
        kp_id: kpId,
        study_date: studyDate
      }
    });
    
    if (!record) {
      record = await UserKpDailyFloat.create({
        user_id: userId,
        kp_id: kpId,
        study_date: studyDate,
        float_value: 0,
        update_count: 0,
        last_update: now
      });
    }
    
    const newFloatValue = record.float_value + delta;
    const newUpdateCount = record.update_count + 1;
    
    await record.update({
      float_value: newFloatValue,
      update_count: newUpdateCount,
      last_update: now
    });
    
    return record;
  } catch (error) {
    console.error('记录每日浮动失败:', error);
    throw error;
  }
};

/**
 * 批量记录知识点每日浮动
 */
const batchRecordDailyFloat = async (userId, updates) => {
  const results = [];
  for (const item of updates) {
    const result = await recordDailyFloat(userId, item.kpId, item.delta);
    results.push(result);
  }
  return results;
};

/**
 * 获取用户某段时间内的知识点浮动统计
 */
// const getUserFloatStats = async (userId, startDate, endDate) => {
//   return await UserKpDailyFloat.findAll({
//     where: {
//       user_id: userId,
//       study_date: {
//         [Op.between]: [startDate, endDate]
//       }
//     },
//     order: [['study_date', 'ASC']]
//   });
// };
const getUserFloatStats = async (userId, startDate, endDate) => {
  return await UserKpDailyFloat.findAll({
    where: {
      user_id: userId,
      study_date: {
        [Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'study_date',
      [sequelize.fn('SUM', sequelize.col('float_value')), 'float_value']
    ],
    group: ['study_date'],
    order: [['study_date', 'ASC']]
  });
};
/**
 * 获取用户某天的学习活跃度
 */
const getUserDailyActivity = async (userId, date) => {
  const records = await UserKpDailyFloat.findAll({
    where: {
      user_id: userId,
      study_date: date
    },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('update_count')), 'total_count']
    ]
  });
  return records[0]?.dataValues.total_count || 0;
};

module.exports = {
  recordDailyFloat,
  batchRecordDailyFloat,
  getUserFloatStats,
  getUserDailyActivity
};