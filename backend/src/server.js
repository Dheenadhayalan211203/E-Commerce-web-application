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

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});