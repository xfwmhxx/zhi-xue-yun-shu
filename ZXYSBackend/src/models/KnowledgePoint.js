const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KnowledgePoint = sequelize.define('KnowledgePoint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '知识点名称（如：太阳病、桂枝汤）'
  },
  type: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '1-理论, 2-方剂, 3-穴位, 4-病机'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '该知识点的核心定义'
  }
}, {
  tableName: 'knowledge_points',
  timestamps: true,
  underscored: true
});

module.exports = KnowledgePoint;