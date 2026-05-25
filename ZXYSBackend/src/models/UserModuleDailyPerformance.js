const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserModuleDailyPerformance = sequelize.define('UserModuleDailyPerformance', {
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
  module_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '模块类型：quiz, unity, interview, read'
  },
  study_date: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: '学习日期：YYYY-MM-DD'
  },
  stat_data: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '统计数据 JSON格式：{"correct": 10, "error": 2, "total_score": 85}'
  },
  related_ids: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '动态ID集合 JSON数组'
  },
  reduce_points: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '发现的弱点 KP_ID 集合 JSON数组'
  }
}, {
  tableName: 'user_module_daily_performance',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'module_type', 'study_date'],
      name: 'unique_user_module_date'
    }
  ]
});

module.exports = UserModuleDailyPerformance;