const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserDailyTask = sequelize.define('UserDailyTask', {
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
  task_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '任务描述'
  },
  task_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '任务类型：read, quiz, unity, interview'
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的具体资源ID'
  },
  goal_value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '目标阈值（分钟/个数/分数）'
  },
  current_value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前进度'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0-进行中, 1-已达标'
  },
  generated_date: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: '生成日期：YYYY-MM-DD'
  }
}, {
  tableName: 'user_daily_task',
  timestamps: true,
  underscored: true
});

module.exports = UserDailyTask;