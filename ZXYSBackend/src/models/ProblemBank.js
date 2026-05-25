const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProblemBank = sequelize.define('ProblemBank', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chapter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关联章节ID'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '题型：单选、多选、填空、判断、案例分析'
  },
  stem: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '题干内容'
  },
  difficulty_text: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '难度分类'
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '难度数值1-5'
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    comment: '本题分值'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON字符串数组'
  },
  page_ref: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '关联原书页码'
  },
  options: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式，存储选项'
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '正确答案'
  },
  analysis: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '深度解析'
  },
  related_kp_ids: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '关联的知识点ID集合，逗号分隔'
  }
}, {
  tableName: 'problem_bank',
  timestamps: true,
  underscored: true
});

module.exports = ProblemBank;