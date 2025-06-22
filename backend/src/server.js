const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User'); // Import User model
const OTP = require('./models/OTP');   // <--- Import OTP model
const Product = require('./models/Product');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Sync database models (creates tables if they don't exist)
// We need to sync both User and OTP models
sequelize.sync()
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

// Middleware
app.use(express.json()); // Body parser for JSON data
app.use(cors()); // Allow all CORS requests for now, configure specific origins in production

// Routes
app.use('/api/auth', authRoutes);

// Example protected route (just for demonstration)
const { protect } = require('./middleware/authMiddleware');
app.get('/api/protected', protect, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}! This is a protected route.` });
});

// Products api 

 // ... (your existing code remains the same until the products API section)

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await sequelize.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Validate ID is a number (adjust regex if using UUIDs)
    if (!/^\d+$/.test(productId)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const [product] = await sequelize.query(
      'SELECT * FROM products WHERE id = ?',
      { replacements: [productId] }
    );

    if (!product || product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product[0]); // Return the first matching product
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    
    // Basic validation
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Category is required' });
    }

    const [products] = await sequelize.query(
      'SELECT * FROM products WHERE category = ?',
      { replacements: [category] }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({ 
        error: 'No products found in this category',
        category: category
      });
    }

    res.json({
      success: true,
      count: products.length,
      category: category,
      products: products
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Product Creation API
app.post('/api/admin/products', protect, async (req, res) => {
  try {
    // Verify admin status (add this check to your authMiddleware)
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const {
      name,
      brand,
      flavors_data, // Array of {name, image} objects
      nicotine_level,
      description,
      image_base64,
      price,
      stock,
      category,
      product_group,
      is_active = true
    } = req.body;

    // Basic validation
    if (!name || !brand || price === undefined) {
      return res.status(400).json({ error: 'Name, brand, and price are required' });
    }

    // Convert flavors array to JSON string
    const flavorsJson = flavors_data ? JSON.stringify(flavors_data) : null;

    // Insert product using raw query to match your existing pattern
    const [result] = await sequelize.query(
      `INSERT INTO products (
        name, brand, flavors_data, nicotine_level, 
        description, image_base64, price, stock,
        category, product_group, is_active, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [
          name,
          brand,
          flavorsJson,
          nicotine_level || null,
          description || null,
          image_base64 || null,
          parseFloat(price),
          stock ? parseInt(stock) : 0,
          category || null,
          product_group || null,
          is_active
        ]
      }
    );

    // Get the inserted product
    const [insertedProduct] = await sequelize.query(
      'SELECT * FROM products WHERE id = ?',
      { replacements: [result.insertId] }
    );

    // Parse flavors_data for the response
    const productWithFlavors = {
      ...insertedProduct[0],
      flavors: flavors_data || []
    };

    res.status(201).json({
      success: true,
      product: productWithFlavors
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});