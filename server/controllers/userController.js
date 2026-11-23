const { db } = require('../config/firebase');

/**
 * Get profile and activity statistics for current authenticated user
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Fetch user doc
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : req.user;

    // Calculate buyer stats (Purchases & Total Spent)
    const ordersSnap = await db.collection('orders').where('buyerId', '==', userId).get();
    let totalPurchases = 0;
    let totalSpending = 0;

    ordersSnap.forEach(doc => {
      const order = doc.data();
      if (order.paymentStatus === 'completed') {
        if (Array.isArray(order.items)) {
          totalPurchases += order.items.length;
        }
        totalSpending += Number(order.totalAmount || 0);
      }
    });

    // Calculate seller stats (Uploaded Products & Total Sales)
    const prodsSnap = await db.collection('products').where('sellerId', '==', userId).get();
    const totalUploadedProducts = prodsSnap.size || 0;
    let totalSalesRevenue = 0;
    let totalItemsSold = 0;

    prodsSnap.forEach(doc => {
      const prod = doc.data();
      const count = Number(prod.salesCount || 0);
      const price = Number(prod.price || 0);
      totalItemsSold += count;
      totalSalesRevenue += count * price;
    });

    return res.status(200).json({
      success: true,
      data: {
        uid: userId,
        email: req.user.email,
        name: userData.name || req.user.name,
        role: req.user.role,
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        status: userData.status || 'active',
        createdAt: userData.createdAt,
        stats: {
          totalPurchases,
          totalSpending: Number(totalSpending.toFixed(2)),
          totalUploadedProducts,
          totalSalesRevenue: Number(totalSalesRevenue.toFixed(2)),
          totalItemsSold
        }
      }
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile information.',
      error: error.message
    });
  }
};

/**
 * Update current user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, bio, avatar, phone } = req.body;

    const userRef = db.collection('users').doc(userId);
    const updates = {};

    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatar) updates.avatar = avatar;
    if (phone) updates.phone = phone.trim();
    updates.updatedAt = new Date().toISOString();

    await userRef.set(updates, { merge: true });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        uid: userId,
        email: req.user.email,
        ...updates
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message
    });
  }
};

module.exports = {
  getMe,
  updateProfile
};
