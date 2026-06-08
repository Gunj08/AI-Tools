const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Tool = require('./Tool');

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  }
}, {
  tableName: 'bookmarks',
  timestamps: true
});

Bookmark.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Bookmark.belongsTo(Tool, { foreignKey: 'toolId', onDelete: 'CASCADE', as: 'tool' });
User.hasMany(Bookmark, { foreignKey: 'userId' });
Tool.hasMany(Bookmark, { foreignKey: 'toolId' });

module.exports = Bookmark;
