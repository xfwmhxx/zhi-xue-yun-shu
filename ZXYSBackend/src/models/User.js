const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_type: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    comment: '1-中医学者, 2-中医求职者, 3-中医通识者'
  },
  is_initialized: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0-未完成, 1-已完成'
  },
  reg_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  user_portrait: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
    comment: '用户画像JSON数据，新用户默认为空，有学习数据后才会生成'
  },
  portrait_updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    comment: '用户画像最后更新时间，新用户为NULL'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;