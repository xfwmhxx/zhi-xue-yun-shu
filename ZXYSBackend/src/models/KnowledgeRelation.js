const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KnowledgeRelation = sequelize.define('KnowledgeRelation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  source_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '源知识点ID'
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '目标知识点ID'
  },
  relation: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '逻辑关系（如：主治、核心病机、组成成分）'
  }
}, {
  tableName: 'knowledge_relations',
  timestamps: true,
  underscored: true,
  indexes: [
    // {
    //   unique: true,
    //   fields: ['source_id', 'target_id', 'relation'],
    //   name: 'unique_relation'
    // }
  ]
});

module.exports = KnowledgeRelation;