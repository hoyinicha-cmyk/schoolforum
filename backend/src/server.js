const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const { setupDatabase } = require('./utils/setupDatabase');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const forumRoutes = require('./routes/forum');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost
    if (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') {
      return callback(null, true);
    }
    
    // Allow any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (origin.match(/^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):3000$/)) {
      return callback(null, true);
    }
    
    // Allow custom frontend URL from env
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // If none match, allow it anyway for development
    callback(null, true);
  },
  credentials: true
}));

// Rate limiting - Increased for development
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 1000, // Increased to 1000 requests
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Serve profile photos from htdocs/upload-photo
app.use('/upload-photo', express.static(path.join(__dirname, '../../../upload-photo')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/follows', require('./routes/follows'));
app.use('/api/contributor', require('./routes/contributor'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'Please upload a file smaller than 5MB'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Invalid file field',
      message: 'Please check the file upload field name'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  console.log('🔧 Setting up database...');
  const dbSetupSuccess = await setupDatabase();
  
  if (!dbSetupSuccess) {
    console.log('⚠️ Database setup failed, but server will still start');
  }

  // Run migrations
  try {
    const { runMigrations } = require('./migrations');
    await runMigrations();
  } catch (error) {
    console.error('⚠️ Migration error:', error.message);
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Accessible from network at http://192.168.100.14:${PORT}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\n📋 Demo Accounts:');
    console.log('   Admin: admin@school.edu / AdminPass123!');
    console.log('   Moderator: moderator@school.edu / ModPass123!');
    console.log('   Student: student@gmail.com / StudentPass123!');
    console.log('\n🌐 Frontend: http://localhost:3000');
    console.log('🔌 Backend API: http://localhost:5000');
  });
};

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});