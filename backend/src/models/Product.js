const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  flavors_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
  },
  nicotine_level: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: null
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    defaultValue: null
  },
  image_base64: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    defaultValue: null
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  stock: {
    type: DataTypes.INTEGER(11),
    allowNull: true,
    defaultValue: 0
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null
  },
  product_group: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null
  },
  is_active: {
    type: DataTypes.TINYINT(1),
    allowNull: true,
    defaultValue: 1
  }
}, {
  tableName: 'products', // Replace with your actual table name
  timestamps: true,
  underscored: true // If your database uses snake_case columns
});

module.exports = Product;