const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserKpDailyFloat = sequelize.define('UserKpDailyFloat', {
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
  kp_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '知识点ID'
  },
  study_date: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: '日期标识：YYYY-MM-DD'
  },
  float_value: {
    type: DataTypes.REAL,
    defaultValue: 0,
    comment: '当日累计浮动分，正确增加，错误减少'
  },
  update_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '今日互动次数'
  },
  last_update: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '该记录最后一次更新的时间'
  }
}, {
  tableName: 'user_kp_daily_float',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'kp_id', 'study_date'],
      name: 'unique_user_kp_date'
    }
  ]
});

module.exports = UserKpDailyFloat;