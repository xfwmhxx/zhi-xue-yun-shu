const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserBookshelf = sequelize.define('UserBookshelf', {
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
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '书籍ID'
  },
  current_chapter: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前阅读章节'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '阅读进度百分比'
  },
  added_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '加入书架时间'
  }
}, {
  tableName: 'user_bookshelf',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'book_id'],
      name: 'unique_user_book'
    }
  ]
});

module.exports = UserBookshelf;