const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserMastery = sequelize.define('UserMastery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关联用户ID'
  },
  point_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关联知识点ID'
  },
  mastery_score: {
    type: DataTypes.REAL,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 1
    },
    comment: '实时掌握度：0.0 ~ 1.0'
  },
  error_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '该知识点累计报错次数'
  },
  last_update: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '最后一次互动时间'
  }
}, {
  tableName: 'user_mastery',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'point_id'],
      name: 'unique_user_point'
    }
  ]
});

module.exports = UserMastery;