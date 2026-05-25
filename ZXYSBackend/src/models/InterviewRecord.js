const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InterviewRecord = sequelize.define('InterviewRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  job_description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '职位描述'
  },
  solve_questions_json: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '用户答题数据JSON'
  },
  emotion_inspect: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '情绪分析原始数据'
  },
  emotion_snapshots: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    comment: '情绪快照路径数组'
  },
  analysis_result: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AI分析结果JSON'
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'analyzing', 'failed', 'completed']]
    },
    comment: 'pending-进行中, analyzing-分析中, failed-分析失败, completed-已完成'
  }
}, {
  tableName: 'interview_records',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InterviewRecord;