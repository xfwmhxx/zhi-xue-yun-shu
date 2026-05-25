const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserResume = sequelize.define('UserResume', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: '关联用户ID'
  },
  resume_data: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '{}',
    comment: '简历JSON数据'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_resumes',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserResume;