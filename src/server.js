require('dotenv').config();
const express = require('express');
const cors = require('cors');
const resumeRoutes = require('./routes/resumeRoutes');

// Create Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: Date.now(),
  });
});

// API routes
app.use('/api', resumeRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Get port from environment or use default
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  const serverUrl = `http://localhost:${PORT}`;
  console.log(`🚀 Server is running on ${serverUrl}`);
  console.log(`📋 Health check: ${serverUrl}/health`);
  console.log(`🔗 API endpoints: ${serverUrl}/api`);
});

module.exports = app;

