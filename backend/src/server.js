const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User'); // Import User model
const OTP = require('./models/OTP');   // <--- Import OTP model

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

app.get('/getproduct/all',(req,res)=()=>
{
  
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});