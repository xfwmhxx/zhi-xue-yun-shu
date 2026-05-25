const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserDailyAISummary = sequelize.define('UserDailyAISummary', {
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
  summary_date: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: '总结日期：YYYY-MM-DD'
  },
  evaluation_content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AI评价全文（JSON格式，不包含daily_tasks）'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0-生成中, 1-已完成'
  }
}, {
  tableName: 'user_daily_ai_summary',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'summary_date'],
      name: 'unique_user_summary_date'
    }
  ]
});

module.exports = UserDailyAISummary; 