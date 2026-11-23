const { db } = require('../config/firebase');

/**
 * Get overall Admin Dashboard overview statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Products
    const productsSnap = await db.collection('products').get();
    let totalProducts = 0;
    let pendingProducts = 0;
    let approvedProducts = 0;

    productsSnap.forEach(doc => {
      totalProducts++;
      const p = doc.data();
      if (p.status === 'pending') pendingProducts++;
      if (p.status === 'approved') approvedProducts++;
    });

    // Users
    const usersSnap = await db.collection('users').get();
    const totalUsers = usersSnap.size || 0;

    // Orders & Sales
    const ordersSnap = await db.collection('orders').get();
    let totalOrders = 0;
    let totalSales = 0;

    ordersSnap.forEach(doc => {
      totalOrders++;
      const order = doc.data();
      if (order.paymentStatus === 'completed') {
        totalSales += Number(order.totalAmount || 0);
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        pendingProducts,
        approvedProducts,
        totalUsers,
        totalOrders,
        totalSales: Number(totalSales.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics.',
      error: error.message
    });
  }
};

/**
 * Get all registered users (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    const users = [];

    usersSnap.forEach(doc => {
      const u = doc.data();
      // Remove sensitive data if any
      delete u.password;
      users.push({
        id: doc.id,
        uid: doc.id,
        ...u
      });
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
      error: error.message
    });
  }
};

/**
 * Update user account status (Activate / Suspend)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (role && (role === 'buyer' || role === 'seller' || role === 'admin')) {
      updates.role = role;
    }
    updates.updatedAt = new Date().toISOString();

    await userRef.update(updates);

    return res.status(200).json({
      success: true,
      message: `User updated successfully.`,
      data: { id, ...userDoc.data(), ...updates }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user.',
      error: error.message
    });
  }
};

/**
 * Get all products across all statuses (Admin only)
 */
const getAllProducts = async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = [];

    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error in admin getAllProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.',
      error: error.message
    });
  }
};

/**
 * Approve or Reject product (Admin only)
 */
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or pending.'
      });
    }

    const prodRef = db.collection('products').doc(id);
    const prodDoc = await prodRef.get();

    if (!prodDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await prodRef.update({
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user.email
    });

    return res.status(200).json({
      success: true,
      message: `Product status updated to ${status}.`
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product status.',
      error: error.message
    });
  }
};

/**
 * Delete product by Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const prodRef = db.collection('products').doc(id);
    const prodDoc = await prodRef.get();

    if (!prodDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await prodRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Product permanently removed by administrator.'
    });
  } catch (error) {
    console.error('Error deleting product by admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
      error: error.message
    });
  }
};

/**
 * Get all platform orders (Admin only)
 */
const getAllOrders = async (req, res) => {
  try {
    const ordersSnap = await db.collection('orders').get();
    const orders = [];

    ordersSnap.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders.',
      error: error.message
    });
  }
};

/**
 * Get comprehensive analytics dataset for Recharts
 * - Monthly Sales Trend
 * - Category Distribution
 * - Most Viewed Products
 * - Top Selling Products
 */
const getAnalytics = async (req, res) => {
  try {
    // 1. Products analysis
    const productsSnap = await db.collection('products').get();
    const categoryCounts = {};
    const viewList = [];
    const salesList = [];

    productsSnap.forEach(doc => {
      const p = doc.data();
      const cat = p.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      viewList.push({
        name: (p.name || p.title || 'Product').slice(0, 24),
        views: p.viewCount || 0,
        price: Number(p.price || 0)
      });

      salesList.push({
        name: (p.name || p.title || 'Product').slice(0, 24),
        sales: p.salesCount || 0,
        revenue: (p.salesCount || 0) * Number(p.price || 0)
      });
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      value: count
    }));

    // Top 5 most viewed
    const mostViewed = viewList.sort((a, b) => b.views - a.views).slice(0, 5);

    // Top 5 top selling
    const topSelling = salesList.sort((a, b) => b.sales - a.sales).slice(0, 5);

    // 2. Orders & Monthly Sales
    const ordersSnap = await db.collection('orders').get();
    const monthlyMap = {};

    // Initialize past 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short' });
      monthlyMap[key] = { month: key, revenue: 0, orders: 0 };
    }

    ordersSnap.forEach(doc => {
      const order = doc.data();
      if (order.createdAt && order.paymentStatus === 'completed') {
        const orderDate = new Date(order.createdAt);
        const mKey = orderDate.toLocaleString('default', { month: 'short' });
        if (monthlyMap[mKey]) {
          monthlyMap[mKey].revenue += Number(order.totalAmount || 0);
          monthlyMap[mKey].orders += 1;
        }
      }
    });

    const monthlySales = Object.values(monthlyMap);

    return res.status(200).json({
      success: true,
      data: {
        monthlySales,
        categoryDistribution,
        mostViewed,
        topSelling
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate analytics data.',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getAllOrders,
  getAnalytics
};
