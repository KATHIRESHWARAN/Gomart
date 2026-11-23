const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Protect all admin endpoints with both authentication and role verification
router.use(verifyToken);
router.use(requireAdmin);

// Dashboard overview
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// Product Management
router.get('/products', adminController.getAllProducts);
router.put('/products/:id/status', adminController.updateProductStatus);
router.delete('/products/:id', adminController.deleteProduct);

// Order Management
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Analytics (Recharts dataset)
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
