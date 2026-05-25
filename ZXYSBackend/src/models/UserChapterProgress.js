const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserChapterProgress = sequelize.define('UserChapterProgress', {
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
  chapter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '章节ID'
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否完成'
  },
  quiz_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '测验得分'
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '完成时间'
  }
}, {
  tableName: 'user_chapter_progress',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'chapter_id'],
      name: 'unique_user_chapter'
    }
  ]
});

module.exports = UserChapterProgress;