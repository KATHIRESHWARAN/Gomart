require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Firebase Admin & Persistence Initialization
const { isLiveFirebase } = require('./config/firebase');

// Route Handlers
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const seedRoutes = require('./routes/seedRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /\.netlify\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback for production API client access
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static uploads directory for thumbnails and digital resources
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Root Endpoint - Redirect to Health Check
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    application: 'E-Products – Digital Products Marketplace API',
    version: '1.0.0',
    firebase: isLiveFirebase ? 'connected (Live Cloud)' : 'development-mode (Local Persistent Firestore)',
    nodeEnv: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Mount Application Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seed', seedRoutes);

// Production Frontend Static Asset & SPA Serving
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// 404 Route Handler for unmatched API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Global Error Handler
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File upload size exceeds maximum allowed limit (50MB).'
        : `File upload error: ${err.message}`
    });
  }

  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Automatically ensure seed data exists on startup if database is empty
const { seedDatabase } = require('./scripts/seed');
const { db } = require('./config/firebase');

const startServer = async () => {
  try {
    const productsCheck = await db.collection('products').get();
    if (productsCheck.empty) {
      console.log('📦 Database appears empty. Automatically populating initial realistic products...');
      await seedDatabase();
    }
  } catch (seedErr) {
    console.warn('Startup seed check notice:', seedErr.message);
  }

  if (require.main === module) {
    const host = '0.0.0.0';
    app.listen(PORT, host, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 E-Products Marketplace API Server running on port ${PORT}`);
      console.log(`🌐 Bound Host: ${host} (Production Render / Cloud compatible)`);
      console.log(`🔗 API Base: http://${host}:${PORT}/api`);
      console.log(`🛡️  Admin Email: ${process.env.ADMIN_EMAIL || 'admin@eproducts.com'}`);
      console.log(`======================================================\n`);
    });
  }
};

startServer();

module.exports = app;
