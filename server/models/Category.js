const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '🔧'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3b82f6'
  }
}, {
  timestamps: true,
  tableName: 'categories'
});

module.exports = Category;
