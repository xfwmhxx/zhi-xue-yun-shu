const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookNodeMap = sequelize.define('BookNodeMap', {
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
  kp_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关联全局知识点ID'
  },
  local_desc: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '该知识点在本专著中的特殊描述'
  }
}, {
  tableName: 'book_node_map',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['book_id', 'kp_id'],
      name: 'unique_book_kp'
    }
  ]
});

module.exports = BookNodeMap;