require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const officeRoutes = require('./routes/offices');
const categoryRoutes = require('./routes/categories');
const assetRoutes = require('./routes/assets');
const loanRoutes = require('./routes/loans');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Telkom Bojonegoro Loan Management System API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// handler error untuk middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'terdapat kesalahan!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'kesalahan server internal'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route tidak ditemukan' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan pada port ${PORT}`);
  // console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  // console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
});
