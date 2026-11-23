const { db } = require('../config/firebase');

/**
 * Process simulated checkout & payment workflow
 * Supports: Simulated UPI, Simulated Card Payment
 * Handles: Success and Simulated Failure outcomes
 */
const checkout = async (req, res) => {
  try {
    const buyerId = req.user.uid;
    const buyerEmail = req.user.email;
    const buyerName = req.user.name || 'Valued Customer';

    const {
      items: directItems,
      paymentMethod, // 'upi', 'card', 'cod', 'netbanking'
      paymentStatus = 'success', // 'success' or 'failed' (for testing/simulation)
      paymentDetails = {},
      shippingAddress = null,
      deliveryFee = 0,
      coupon = null
    } = req.body;

    // Determine purchase items: either passed directly (e.g. "Buy Now") or from user's cart
    let itemsToPurchase = [];

    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      itemsToPurchase = directItems;
    } else {
      // Read items from shopping cart
      const cartDoc = await db.collection('carts').doc(buyerId).get();
      if (!cartDoc.exists || !cartDoc.data().items || cartDoc.data().items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your shopping cart is empty. Please add products before checking out.'
        });
      }
      itemsToPurchase = cartDoc.data().items;
    }

    // Validate each item and prevent self-purchases
    let itemsSubtotal = 0;
    const validatedItems = [];

    for (const item of itemsToPurchase) {
      const prodDoc = await db.collection('products').doc(item.productId).get();
      if (!prodDoc.exists) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name || item.productId} no longer exists.`
        });
      }

      const prod = prodDoc.data();

      // Rule: Users must not purchase their own products
      if (prod.sellerId === buyerId) {
        return res.status(400).json({
          success: false,
          message: `You cannot purchase your own product: "${prod.name || prod.title}".`
        });
      }

      const price = Number(prod.price);
      const qty = item.quantity && Number(item.quantity) > 0 ? Number(item.quantity) : 1;
      itemsSubtotal += price * qty;

      validatedItems.push({
        productId: item.productId,
        name: prod.name || prod.title,
        title: prod.title || prod.name,
        price,
        originalPrice: prod.originalPrice || Math.round(price * 1.3),
        discountPercent: prod.discountPercent || 25,
        category: prod.category,
        brand: prod.brand || 'GoMart Brand',
        thumbnailUrl: prod.thumbnailUrl,
        sellerId: prod.sellerId,
        sellerName: prod.sellerName,
        digitalFileUrl: prod.digitalFileUrl,
        quantity: qty,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null
      });
    }

    // Check payment outcome simulation
    if (paymentStatus === 'failed') {
      return res.status(400).json({
        success: false,
        paymentStatus: 'failed',
        message: 'Simulated Payment Failed. Transaction was declined or cancelled by customer.'
      });
    }

    // Calculate final payable amount
    let discountAmount = 0;
    if (coupon && coupon.discountAmount) {
      discountAmount = Number(coupon.discountAmount);
    }
    const finalDeliveryFee = Number(deliveryFee) || 0;
    const totalAmount = Math.max(0, itemsSubtotal - discountAmount + finalDeliveryFee);
    const finalTotal = totalAmount;

    // Generate unique professional Order ID
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `ORD-${timestamp}-${randomSuffix}`;
    const transactionId = `TXN-${paymentMethod?.toUpperCase() || 'SIM'}-${Date.now()}`;

    const newOrder = {
      orderId,
      transactionId,
      buyerId,
      buyerEmail,
      buyerName,
      shippingAddress: shippingAddress || {
        fullName: buyerName,
        phone: '+91 98765 43210',
        street: '42 Commercial Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        type: 'Home'
      },
      items: validatedItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        category: item.category,
        brand: item.brand,
        thumbnailUrl: item.thumbnailUrl,
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      })),
      subtotal: Number(itemsSubtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      deliveryFee: Number(finalDeliveryFee.toFixed(2)),
      totalAmount: Number(finalTotal.toFixed(2)),
      coupon: coupon ? { code: coupon.code, discountAmount } : null,
      paymentMethod: paymentMethod || 'Simulated UPI',
      paymentStatus: paymentMethod === 'cod' ? 'pending_delivery' : 'completed',
      orderStatus: 'Order Placed',
      trackingEvents: [
        { status: 'Order Placed', time: new Date().toISOString(), message: 'Your order has been placed successfully.' }
      ],
      isDemoTransaction: true,
      createdAt: new Date().toISOString()
    };

    // Save order in Firestore
    const orderRef = await db.collection('orders').add(newOrder);

    // Update sales count and earnings for each product & seller
    for (const item of validatedItems) {
      try {
        const prodDoc = await db.collection('products').doc(item.productId).get();
        if (prodDoc.exists) {
          const currentSales = (prodDoc.data().salesCount || 0) + 1;
          await db.collection('products').doc(item.productId).update({
            salesCount: currentSales
          });
        }
      } catch (e) {
        console.warn('Could not update salesCount for', item.productId, e.message);
      }
    }

    // Clear shopping cart for user
    await db.collection('carts').doc(buyerId).set({
      userId: buyerId,
      items: [],
      updatedAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Digital products are now available for download.',
      order: {
        id: orderRef.id,
        orderId,
        transactionId,
        totalAmount: Number(totalAmount.toFixed(2)),
        items: validatedItems,
        createdAt: newOrder.createdAt
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process checkout transaction.',
      error: error.message
    });
  }
};

/**
 * Get all orders placed by the current authenticated user
 */
const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.uid;
    const snapshot = await db.collection('orders').where('buyerId', '==', buyerId).get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders.',
      error: error.message
    });
  }
};

/**
 * Get all verified digital product purchases for current user with download availability
 */
const getMyPurchases = async (req, res) => {
  try {
    const buyerId = req.user.uid;
    const snapshot = await db.collection('orders').where('buyerId', '==', buyerId).get();

    const purchasesMap = new Map();

    snapshot.forEach(doc => {
      const order = doc.data();
      if (order.paymentStatus === 'completed' && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!purchasesMap.has(item.productId)) {
            purchasesMap.set(item.productId, {
              ...item,
              orderId: order.orderId,
              purchaseDate: order.createdAt,
              downloadUrl: `/api/downloads/${item.productId}`
            });
          }
        });
      }
    });

    const purchases = Array.from(purchasesMap.values());
    purchases.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchases.',
      error: error.message
    });
  }
};

/**
 * Get single order details
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderDoc = await db.collection('orders').doc(id).get();

    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = orderDoc.data();

    // Verify access permission
    if (order.buyerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    return res.status(200).json({
      success: true,
      data: { id: orderDoc.id, ...order }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order.',
      error: error.message
    });
  }
};

/**
 * Cancel an order (by buyer or admin)
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = orderDoc.data();

    // Check ownership
    if (order.buyerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own orders.'
      });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be cancelled.'
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This order is already cancelled.'
      });
    }

    const updatedEvents = Array.isArray(order.trackingEvents) ? [...order.trackingEvents] : [];
    updatedEvents.push({
      status: 'Cancelled',
      time: new Date().toISOString(),
      message: 'Order was cancelled by customer request.'
    });

    await orderRef.update({
      orderStatus: 'Cancelled',
      paymentStatus: 'refund_initiated',
      trackingEvents: updatedEvents,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order.',
      error: error.message
    });
  }
};

/**
 * Update order status (Admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = orderDoc.data();
    const updatedEvents = Array.isArray(order.trackingEvents) ? [...order.trackingEvents] : [];
    updatedEvents.push({
      status: orderStatus,
      time: new Date().toISOString(),
      message: `Status updated to ${orderStatus}.`
    });

    await orderRef.update({
      orderStatus,
      trackingEvents: updatedEvents,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}.`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status.',
      error: error.message
    });
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getMyPurchases,
  getOrderById,
  cancelOrder,
  updateOrderStatus
};
