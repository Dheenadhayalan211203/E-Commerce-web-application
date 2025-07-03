const { Cart, Product, User } = require('./index'); // Adjust path as needed

function setupAssociations() {
  // Cart belongs to Product
  Cart.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // Cart belongs to User
  Cart.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Product has many Cart items
  Product.hasMany(Cart, {
    foreignKey: 'product_id',
    as: 'cartItems'
  });

  console.log('✅ Model associations set up!');
}

module.exports = setupAssociations;