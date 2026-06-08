const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Category = require('./Category');

const Tool = sequelize.define('Tool', {
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
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shortDesc: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  tags: {
    type: DataTypes.TEXT, // Store as JSON string, parse as array in JS
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('tags');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch (err) {
        return rawValue ? rawValue.split(',').map(t => t.trim()) : [];
      }
    },
    set(value) {
      this.setDataValue('tags', Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([value]));
    }
  },
  websiteUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  logoUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  pricing: {
    type: DataTypes.ENUM('Free', 'Freemium', 'Paid', 'Open Source'),
    defaultValue: 'Freemium'
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  votes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'tools'
});

// Configure association
Tool.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Tool, { foreignKey: 'categoryId', as: 'tools', onDelete: 'CASCADE' });

const User = require('./User');
Tool.belongsTo(User, { foreignKey: 'userId', as: 'submittedBy' });
User.hasMany(Tool, { foreignKey: 'userId', as: 'submissions' });

module.exports = Tool;
