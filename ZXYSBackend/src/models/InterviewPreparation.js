const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InterviewPreparation = sequelize.define('InterviewPreparation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: '用户ID'
  },
  job_description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '职位描述/职位名称'
  },
  questions_json: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '面试题目JSON数组'
  }
}, {
  tableName: 'interview_preparations',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InterviewPreparation;