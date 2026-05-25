const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookDetail = sequelize.define('BookDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '书名'
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '作者'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '经典类型：classic / textbook'
  },
  introduce: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '简介'
  },
  volume: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '卷数/篇数'
  },
  tag_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '关联知识点总数'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式，存储label/value对'
  },
  cover_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '封面图片路径'
  },
  doc_path: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '源文件路径'
  }
}, {
  tableName: 'book_details',
  timestamps: true,
  underscored: true
});

module.exports = BookDetail;