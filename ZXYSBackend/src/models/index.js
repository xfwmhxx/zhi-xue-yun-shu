const { Sequelize, Op } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const VerificationCode = require('./VerificationCode');
const KnowledgePoint = require('./KnowledgePoint');
const KnowledgeRelation = require('./KnowledgeRelation');
const UserMastery = require('./UserMastery');
const BookDetail = require('./BookDetail');
const BookNodeMap = require('./BookNodeMap');
const BookChapter = require('./BookChapter');
const ProblemBank = require('./ProblemBank');
const UserBookshelf = require('./UserBookshelf');
const UserChapterProgress = require('./UserChapterProgress');
const UserKpDailyFloat = require('./UserKpDailyFloat');
const UserModuleDailyPerformance = require('./UserModuleDailyPerformance');
const UserDailyAISummary = require('./UserDailyAISummary');
const UserDailyTask = require('./UserDailyTask');
const UserResume = require('./UserResume');
const InterviewPreparation = require('./InterviewPreparation');
const InterviewRecord = require('./InterviewRecord');

sequelize.Op = Op;

// ========== 知识图谱关联 ==========
KnowledgePoint.hasMany(KnowledgeRelation, { as: 'outgoing', foreignKey: 'source_id' });
KnowledgePoint.hasMany(KnowledgeRelation, { as: 'incoming', foreignKey: 'target_id' });
KnowledgeRelation.belongsTo(KnowledgePoint, { as: 'source', foreignKey: 'source_id' });
KnowledgeRelation.belongsTo(KnowledgePoint, { as: 'target', foreignKey: 'target_id' });

// ========== 掌握度关联 ==========
User.hasMany(UserMastery, { foreignKey: 'user_id' });
UserMastery.belongsTo(User, { foreignKey: 'user_id' });
KnowledgePoint.hasMany(UserMastery, { foreignKey: 'point_id' });
UserMastery.belongsTo(KnowledgePoint, { foreignKey: 'point_id' });

// ========== 书籍关联 ==========
// 书籍 -> 章节
BookDetail.hasMany(BookChapter, { foreignKey: 'book_id' });
BookChapter.belongsTo(BookDetail, { foreignKey: 'book_id' });

// 书籍 -> 知识点映射
BookDetail.hasMany(BookNodeMap, { foreignKey: 'book_id' });
BookNodeMap.belongsTo(BookDetail, { foreignKey: 'book_id' });
KnowledgePoint.hasMany(BookNodeMap, { foreignKey: 'kp_id' });
BookNodeMap.belongsTo(KnowledgePoint, { foreignKey: 'kp_id' });

// 章节 -> 题目
BookChapter.hasMany(ProblemBank, { foreignKey: 'chapter_id' });
ProblemBank.belongsTo(BookChapter, { foreignKey: 'chapter_id' });

// 用户书架
User.hasMany(UserBookshelf, { foreignKey: 'user_id' });
UserBookshelf.belongsTo(User, { foreignKey: 'user_id' });
BookDetail.hasMany(UserBookshelf, { foreignKey: 'book_id' });
UserBookshelf.belongsTo(BookDetail, { foreignKey: 'book_id' });

// 用户章节进度
User.hasMany(UserChapterProgress, { foreignKey: 'user_id' });
UserChapterProgress.belongsTo(User, { foreignKey: 'user_id' });
BookChapter.hasMany(UserChapterProgress, { foreignKey: 'chapter_id' });
UserChapterProgress.belongsTo(BookChapter, { foreignKey: 'chapter_id' });



// 学习进度和反馈连接
UserKpDailyFloat.belongsTo(KnowledgePoint, { foreignKey: 'kp_id' });
KnowledgePoint.hasMany(UserKpDailyFloat, { foreignKey: 'kp_id' });

// ========== 用户简历关联 ==========
User.hasOne(UserResume, { foreignKey: 'user_id' });
UserResume.belongsTo(User, { foreignKey: 'user_id' });

// 用户与面试准备关联
User.hasMany(InterviewPreparation, { foreignKey: 'user_id' });
InterviewPreparation.belongsTo(User, { foreignKey: 'user_id' });

// 面试记录分析表的部分关联
User.hasMany(InterviewRecord, { foreignKey: 'user_id' });
InterviewRecord.belongsTo(User, { foreignKey: 'user_id' });

const initDatabase = async () => {
  try {
    // await sequelize.sync({ alter: true });
    await sequelize.sync();
    // await sequelize.sync({ force: false });
    console.log('数据库同步成功');
  } catch (error) {
    console.error('数据库同步失败:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Op,
  User,
  VerificationCode,
  KnowledgePoint,
  KnowledgeRelation,
  UserMastery,
  BookDetail,
  BookNodeMap,
  BookChapter,
  ProblemBank,
  UserBookshelf,
  UserChapterProgress,
  UserKpDailyFloat,
  UserModuleDailyPerformance,
  UserDailyAISummary,
  UserDailyTask,
  UserResume,
  InterviewPreparation,
  InterviewRecord,
  initDatabase
};