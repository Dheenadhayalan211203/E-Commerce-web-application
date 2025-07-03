const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: "cart",
    timestamps: true,
    underscored: true,
  }
);

Cart.associate = function(models) {
  // Each Cart item belongs to a Product
  Cart.belongsTo(models.Product, {
    foreignKey: 'product_id',  // References Product.id
    as: 'product'             // Optional alias for queries
  });

  // Each Cart item belongs to a User (if needed)
  Cart.belongsTo(models.User, {
    foreignKey: 'user_id',    // References User.id
    as: 'user'                // Optional alias for queries
  });
};

module.exports = Cart;
