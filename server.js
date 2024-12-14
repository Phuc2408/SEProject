const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const authRoutes = require('./api/auth');
const userRoutes = require('./api/user');
const adminRoutes = require('./api/admin');
const userBookRoutes = require('./api/userBook');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

//admin
app.use('/api/admin', adminRoutes);

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);  // Auth-related routes (signup, signin)
app.use('/api/users', userRoutes); // User-related routes
app.use('/api/user-books', userBookRoutes); // Thêm API cho user-books
// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route for all other requests to serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'statics', 'homepage', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
