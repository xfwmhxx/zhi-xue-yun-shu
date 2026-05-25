const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookChapter = sequelize.define('BookChapter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关联书籍ID'
  },
  chapter_idx: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '章节序号'
  },
  chapter_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '章节标题'
  },
  suggest_time: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '建议学习时长'
  },
  difficulty_star: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '难度星级'
  },
  key_points_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '本章核心知识点数量'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序序号'
  }
}, {
  tableName: 'book_chapters',
  timestamps: true,
  underscored: true
});

module.exports = BookChapter;