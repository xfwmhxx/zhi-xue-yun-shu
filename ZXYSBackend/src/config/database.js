const { Sequelize } = require('sequelize');
const path = require('path');

// 创建Sequelize实例
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: console.log, // 开发环境打印SQL日志
  define: {
    timestamps: true, // 自动添加 createdAt 和 updatedAt
    underscored: true // 使用下划线命名
  }
});

module.exports = sequelize;