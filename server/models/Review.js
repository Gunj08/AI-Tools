const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Tool = require('./Tool');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'reviews',
  timestamps: true
});

Review.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'user' });
Review.belongsTo(Tool, { foreignKey: 'toolId', onDelete: 'CASCADE', as: 'tool' });
User.hasMany(Review, { foreignKey: 'userId' });
Tool.hasMany(Review, { foreignKey: 'toolId' });

module.exports = Review;
