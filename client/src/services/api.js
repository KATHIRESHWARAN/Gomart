import axios from 'axios';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { db, auth, storage } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s base timeout to safely accommodate Render cold starts
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eproducts_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Allow the browser to automatically set multipart/form-data with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const VALID_CATEGORIES = [
  'E-books',
  'Tutorials',
  'Study Materials',
  'Templates',
  'PDFs',
  'Design Resources',
  'Notes & Guides',
  'Electronics',
  'Mobiles',
  'Laptops',
  'Fashion',
  "Men's Clothing",
  "Women's Clothing",
  'Footwear',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Grocery',
  'Accessories',
  'Sports & Fitness',
  'Toys & Games',
  'Books'
];

export const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) {
    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
    return baseUrl ? `${baseUrl}${url}` : url;
  }
  return url;
};

// ==========================================
// 1. PRODUCT SERVICE (Express REST + Firebase Resilient Fallback)
// ==========================================
export const productService = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/products', { params });
      if (res.data?.success) return res;
    } catch (e) {
      // Graceful fallback to Cloud Firestore
    }

    try {
      const { search, category, brand, minPrice, maxPrice, minRating, minDiscount, sort, status } = params;
      const snap = await getDocs(collection(db, 'products'));
      let products = [];
      snap.forEach((d) => products.push({ id: d.id, ...d.data() }));

      const targetStatus = status || 'approved';
      if (targetStatus !== 'all') {
        products = products.filter((p) => (p.status || 'approved') === targetStatus);
      }

      if (category && category !== 'All' && category !== 'all') {
        products = products.filter((p) => p.category && p.category.toLowerCase() === category.toLowerCase());
      }

      if (brand && brand !== 'All' && brand !== 'all') {
        const brandList = Array.isArray(brand)
          ? brand.map((b) => b.toLowerCase().trim())
          : brand.split(',').map((b) => b.toLowerCase().trim());
        products = products.filter((p) => p.brand && brandList.includes(p.brand.toLowerCase().trim()));
      }

      if (minPrice && !isNaN(Number(minPrice))) {
        products = products.filter((p) => Number(p.price) >= Number(minPrice));
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        products = products.filter((p) => Number(p.price) <= Number(maxPrice));
      }
      if (minRating && !isNaN(Number(minRating))) {
        products = products.filter((p) => Number(p.rating || 0) >= Number(minRating));
      }
      if (minDiscount && !isNaN(Number(minDiscount))) {
        products = products.filter((p) => Number(p.discountPercent || 0) >= Number(minDiscount));
      }

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        products = products.filter((p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.sellerName && p.sellerName.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }

      if (sort === 'price_asc' || sort === 'price_low') {
        products.sort((a, b) => Number(a.price) - Number(b.price));
      } else if (sort === 'price_desc' || sort === 'price_high') {
        products.sort((a, b) => Number(b.price) - Number(a.price));
      } else if (sort === 'rating') {
        products.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
      } else if (sort === 'popular') {
        products.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      } else if (sort === 'top_selling') {
        products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
      } else {
        products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }

      return { data: { success: true, count: products.length, data: products } };
    } catch (err) {
      console.error('Error in productService.getAll:', err);
      return { data: { success: false, data: [] } };
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data?.success) return res;
    } catch (e) {
      // Fallback
    }

    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const err = new Error('Product not found.');
        err.response = { status: 404, data: { success: false, message: 'Product not found.' } };
        throw err;
      }
      updateDoc(docRef, { viewCount: increment(1) }).catch(() => {});
      return { data: { success: true, data: { id: docSnap.id, ...docSnap.data() } } };
    } catch (err) {
      throw err;
    }
  },

  getCategories: async () => {
    try {
      const res = await api.get('/products/categories');
      if (res.data?.success) return res;
    } catch (e) {}
    return { data: { success: true, data: VALID_CATEGORIES } };
  },

  getSellerProducts: async () => {
    try {
      const res = await api.get('/products/seller/my-products');
      if (res.data?.success) return res;
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: true, count: 0, data: [] } };
    try {
      const q = query(collection(db, 'products'), where('sellerId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const products = [];
      snap.forEach((d) => products.push({ id: d.id, ...d.data() }));
      products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return { data: { success: true, count: products.length, data: products } };
    } catch (err) {
      return { data: { success: false, count: 0, data: [] } };
    }
  },

  create: async (data, onProgress) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    try {
      const res = await api.post('/products', data, {
        timeout: isFormData ? 180000 : 45000, // 3 minutes for file uploads, 45 seconds for cold start
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });
      if (res.data?.success) return res;
    } catch (e) {
      // If the backend sent a clear validation, permission or size error, rethrow directly
      if (e.response?.data?.message) {
        throw new Error(e.response.data.message);
      }
      if (e.response?.status === 400 || e.response?.status === 401 || e.response?.status === 403) {
        throw e;
      }
      console.warn('Backend service notice, proceeding with direct Firebase resilience fallback...', e.message);
    }

    // Resilient Firebase Fallback
    const currentUser = auth.currentUser;
    let sellerId = currentUser?.uid;
    let sellerName = currentUser?.displayName;
    let sellerEmail = currentUser?.email;

    if (!sellerId) {
      try {
        const cached = localStorage.getItem('eproducts_cached_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          sellerId = parsed.uid;
          sellerName = parsed.name || parsed.displayName;
          sellerEmail = parsed.email;
        }
      } catch (cErr) {}
    }

    if (!sellerId && !localStorage.getItem('eproducts_auth_token')) {
      throw new Error('Please sign in as a seller or admin to publish products.');
    }

    sellerId = sellerId || 'usr_creator';
    sellerName = sellerName || 'GoMart Creator';
    sellerEmail = sellerEmail || 'creator@gomart.app';

    try {
      let name = '';
      let description = '';
      let price = 0;
      let category = 'E-books';
      let fileType = 'PDF Document';
      let fileSize = '15.4 MB';
      let tags = [];
      let thumbnailUrl = '';
      let digitalFileUrl = '';

      if (data instanceof FormData) {
        name = data.get('name') || data.get('title') || 'Untitled Product';
        description = data.get('description') || '';
        price = Number(data.get('price')) || 0;
        category = data.get('category') || 'E-books';
        fileType = data.get('fileType') || 'Digital Deliverable';
        fileSize = data.get('fileSize') || 'N/A';
        const rawTags = data.get('tags') || '';
        tags = typeof rawTags === 'string' ? rawTags.split(',').map((t) => t.trim()).filter(Boolean) : [];

        const thumbFile = data.get('thumbnail');
        if (thumbFile && typeof thumbFile === 'object' && thumbFile.size > 0) {
          try {
            const thumbRef = ref(storage, `thumbnails/${Date.now()}_${thumbFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
            const snap = await uploadBytes(thumbRef, thumbFile);
            thumbnailUrl = await getDownloadURL(snap.ref);
          } catch (storageErr) {
            console.warn('Firebase Storage thumbnail notice:', storageErr.message);
            thumbnailUrl = data.get('thumbnailUrl') || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
          }
        } else {
          thumbnailUrl = data.get('thumbnailUrl') || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
        }

        const digFile = data.get('digitalFile');
        if (digFile && typeof digFile === 'object' && digFile.size > 0) {
          try {
            const fileRef = ref(storage, `products/${Date.now()}_${digFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
            const snap = await uploadBytes(fileRef, digFile);
            digitalFileUrl = await getDownloadURL(snap.ref);
          } catch (storageErr) {
            console.warn('Firebase Storage digital file notice:', storageErr.message);
            digitalFileUrl = data.get('digitalFileUrl') || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
          }
        } else {
          digitalFileUrl = data.get('digitalFileUrl') || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        }
      } else {
        name = data.name || data.title || 'Untitled Product';
        description = data.description || '';
        price = Number(data.price) || 0;
        category = data.category || 'E-books';
        fileType = data.fileType || 'Digital Deliverable';
        fileSize = data.fileSize || 'N/A';
        tags = Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map((t) => t.trim()).filter(Boolean) : []);
        thumbnailUrl = data.thumbnailUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
        digitalFileUrl = data.digitalFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      }

      const prodId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newProduct = {
        id: prodId,
        name,
        title: name,
        description,
        price,
        originalPrice: Math.round(price * 1.3),
        discountPercent: 25,
        category,
        brand: data.brand || 'GoMart Creator',
        thumbnailUrl,
        digitalFileUrl,
        fileType,
        fileSize,
        tags,
        sellerId: sellerId,
        sellerName: sellerName,
        sellerEmail: sellerEmail,
        status: 'approved',
        viewCount: 0,
        salesCount: 0,
        rating: 5.0,
        reviewCount: 0,
        stockQuantity: 999,
        inStock: true,
        isDigital: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'products', prodId), newProduct);
      return { data: { success: true, data: newProduct } };
    } catch (err) {
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      const res = await api.put(`/products/${id}`, data);
      if (res.data?.success) return res;
    } catch (e) {}

    const updates = { ...(data instanceof FormData ? {} : data), updatedAt: new Date().toISOString() };
    await updateDoc(doc(db, 'products', id), updates);
    return { data: { success: true, data: { id, ...updates } } };
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data?.success) return res;
    } catch (e) {}

    await deleteDoc(doc(db, 'products', id));
    return { data: { success: true, message: 'Product deleted successfully.' } };
  }
};

// ==========================================
// 2. CART SERVICE
// ==========================================
export const cartService = {
  get: async () => {
    try {
      const res = await api.get('/cart');
      if (res.data?.success) return res;
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: true, items: [], subtotal: 0, total: 0 } };

    try {
      const cartDoc = await getDoc(doc(db, 'carts', currentUser.uid));
      if (!cartDoc.exists()) return { data: { success: true, items: [], subtotal: 0, total: 0 } };
      const rawItems = cartDoc.data().items || [];
      const subtotal = rawItems.reduce((acc, it) => acc + (Number(it.price) * (it.quantity || 1)), 0);
      return {
        data: {
          success: true,
          items: rawItems,
          subtotal: Number(subtotal.toFixed(2)),
          total: Number(subtotal.toFixed(2))
        }
      };
    } catch (err) {
      return { data: { success: true, items: [], subtotal: 0, total: 0 } };
    }
  },

  add: async (productId, quantity = 1, selectedVariant = {}) => {
    try {
      const res = await api.post('/cart', { productId, quantity, ...selectedVariant });
      if (res.data?.success) return res;
    } catch (e) {
      if (e.response?.status === 400) throw e;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Please sign in to add items.');

    const qty = Math.max(1, Number(quantity) || 1);
    const prodSnap = await getDoc(doc(db, 'products', productId));
    if (!prodSnap.exists()) throw new Error('Product not found.');

    const product = prodSnap.data();
    if (product.sellerId === currentUser.uid) {
      const err = new Error('You cannot purchase your own product.');
      err.response = { status: 400, data: { message: 'You cannot purchase your own product.' } };
      throw err;
    }

    const cartRef = doc(db, 'carts', currentUser.uid);
    const cartSnap = await getDoc(cartRef);
    let items = cartSnap.exists() ? (cartSnap.data().items || []) : [];

    const existingIndex = items.findIndex((it) => it.productId === productId);
    if (existingIndex > -1) {
      items[existingIndex].quantity = (items[existingIndex].quantity || 1) + qty;
    } else {
      items.push({
        productId,
        name: product.name || product.title,
        title: product.title || product.name,
        price: Number(product.price),
        originalPrice: product.originalPrice || Math.round(Number(product.price) * 1.3),
        discountPercent: product.discountPercent || 25,
        category: product.category,
        brand: product.brand || 'GoMart Brand',
        thumbnailUrl: product.thumbnailUrl,
        sellerId: product.sellerId,
        quantity: qty,
        selectedSize: selectedVariant.size || null,
        selectedColor: selectedVariant.color || null,
        addedAt: new Date().toISOString()
      });
    }

    await setDoc(cartRef, { userId: currentUser.uid, items, updatedAt: new Date().toISOString() });
    return { data: { success: true, items } };
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      if (res.data?.success) return res;
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: false } };
    const qty = Number(quantity);
    const cartRef = doc(db, 'carts', currentUser.uid);
    const cartSnap = await getDoc(cartRef);
    if (!cartSnap.exists()) return { data: { success: true, items: [] } };

    let items = cartSnap.data().items || [];
    if (qty <= 0) {
      items = items.filter((it) => it.productId !== productId);
    } else {
      items = items.map((it) => (it.productId === productId ? { ...it, quantity: qty } : it));
    }
    await setDoc(cartRef, { userId: currentUser.uid, items, updatedAt: new Date().toISOString() });
    return { data: { success: true, items } };
  },

  remove: async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data?.success) return res;
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: false } };
    const cartRef = doc(db, 'carts', currentUser.uid);
    const cartSnap = await getDoc(cartRef);
    if (!cartSnap.exists()) return { data: { success: true, items: [] } };

    const items = (cartSnap.data().items || []).filter((it) => it.productId !== productId);
    await setDoc(cartRef, { userId: currentUser.uid, items, updatedAt: new Date().toISOString() });
    return { data: { success: true, items } };
  },

  clear: async () => {
    try {
      const res = await api.delete('/cart');
      if (res.data?.success) return res;
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: true } };
    const cartRef = doc(db, 'carts', currentUser.uid);
    await setDoc(cartRef, { userId: currentUser.uid, items: [], updatedAt: new Date().toISOString() });
    return { data: { success: true } };
  }
};

// ==========================================
// 3. ORDER SERVICE
// ==========================================
export const orderService = {
  checkout: async (payload) => {
    try {
      const res = await api.post('/orders/checkout', payload);
      if (res.data?.success) return res;
    } catch (e) {
      if (e.response?.status === 400) throw e;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');

    const {
      items: directItems,
      paymentMethod = 'card',
      paymentStatus = 'success',
      shippingAddress = null,
      deliveryFee = 0,
      coupon = null
    } = payload;

    if (paymentStatus === 'failed') {
      const err = new Error('Simulated Payment Failed. Transaction was declined or cancelled.');
      err.response = { status: 400, data: { success: false, paymentStatus: 'failed', message: err.message } };
      throw err;
    }

    let itemsToPurchase = [];
    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      itemsToPurchase = directItems;
    } else {
      const cartSnap = await getDoc(doc(db, 'carts', currentUser.uid));
      if (!cartSnap.exists() || !cartSnap.data().items || cartSnap.data().items.length === 0) {
        const err = new Error('Your shopping cart is empty.');
        err.response = { status: 400, data: { message: err.message } };
        throw err;
      }
      itemsToPurchase = cartSnap.data().items;
    }

    let itemsSubtotal = 0;
    const validatedItems = [];

    for (const item of itemsToPurchase) {
      const prodSnap = await getDoc(doc(db, 'products', item.productId));
      if (!prodSnap.exists()) {
        const err = new Error(`Product ${item.name || item.productId} no longer exists.`);
        err.response = { status: 404, data: { message: err.message } };
        throw err;
      }
      const prod = prodSnap.data();
      if (prod.sellerId === currentUser.uid) {
        const err = new Error(`You cannot purchase your own product: "${prod.name || prod.title}".`);
        err.response = { status: 400, data: { message: err.message } };
        throw err;
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

      updateDoc(doc(db, 'products', item.productId), { salesCount: increment(qty) }).catch(() => {});
    }

    let discountAmount = 0;
    if (coupon && coupon.discountAmount) discountAmount = Number(coupon.discountAmount);
    const finalDeliveryFee = Number(deliveryFee) || 0;
    const totalAmount = Math.max(0, itemsSubtotal - discountAmount + finalDeliveryFee);

    const timestamp = Date.now();
    const orderId = `ORD-${timestamp}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const transactionId = `TXN-${paymentMethod.toUpperCase()}-${timestamp}`;

    const newOrder = {
      id: orderId,
      orderId,
      transactionId,
      buyerId: currentUser.uid,
      buyerEmail: currentUser.email,
      buyerName: currentUser.displayName || shippingAddress?.fullName || currentUser.email?.split('@')[0] || 'Customer',
      shippingAddress: shippingAddress || {
        deliveryType: 'Instant Digital Download',
        email: currentUser.email,
        licenseType: 'Commercial / Developer License'
      },
      items: validatedItems,
      subtotal: Number(itemsSubtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      deliveryFee: Number(finalDeliveryFee.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      coupon: coupon ? { code: coupon.code, discountAmount } : null,
      paymentMethod,
      paymentStatus: 'completed',
      orderStatus: 'Order Placed',
      trackingEvents: [
        { status: 'Order Placed', time: new Date().toISOString(), message: 'Your order has been placed successfully.' }
      ],
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'orders', orderId), newOrder);
    setDoc(doc(db, 'carts', currentUser.uid), { userId: currentUser.uid, items: [], updatedAt: new Date().toISOString() }).catch(() => {});

    return { data: { success: true, data: newOrder } };
  },

  getMyOrders: async () => {
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data?.success) return res;
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: true, count: 0, data: [] } };
    try {
      const q = query(collection(db, 'orders'), where('buyerId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const orders = [];
      snap.forEach((d) => orders.push({ id: d.id, ...d.data() }));
      orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return { data: { success: true, count: orders.length, data: orders } };
    } catch (err) {
      return { data: { success: false, count: 0, data: [] } };
    }
  },

  getMyPurchases: async () => {
    try {
      const res = await api.get('/orders/my-purchases');
      if (res.data?.success) return res;
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: true, count: 0, data: [] } };
    try {
      const q = query(collection(db, 'orders'), where('buyerId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const purchasesMap = new Map();

      snap.forEach((d) => {
        const order = d.data();
        if (order.paymentStatus === 'completed' && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const key = item.productId || item.id;
            if (key && !purchasesMap.has(key)) {
              purchasesMap.set(key, {
                orderId: order.orderId || d.id,
                purchaseDate: order.createdAt,
                paymentMethod: order.paymentMethod,
                transactionId: order.transactionId,
                totalAmount: order.totalAmount,
                ...item,
                downloadAvailable: true,
                downloadUrl: item.digitalFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
              });
            }
          });
        }
      });

      const purchases = Array.from(purchasesMap.values());
      purchases.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));
      return { data: { success: true, count: purchases.length, data: purchases } };
    } catch (err) {
      return { data: { success: false, count: 0, data: [] } };
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data?.success) return res;
    } catch (e) {}

    const docSnap = await getDoc(doc(db, 'orders', id));
    if (!docSnap.exists()) {
      const err = new Error('Order not found.');
      err.response = { status: 404, data: { message: err.message } };
      throw err;
    }
    return { data: { success: true, data: { id: docSnap.id, ...docSnap.data() } } };
  },

  cancelOrder: async (id) => {
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      if (res.data?.success) return res;
    } catch (e) {}

    await updateDoc(doc(db, 'orders', id), {
      orderStatus: 'Cancelled',
      updatedAt: new Date().toISOString()
    });
    return { data: { success: true, message: 'Order cancelled successfully.' } };
  }
};

// ==========================================
// 4. DOWNLOAD SERVICE
// ==========================================
export const downloadService = {
  download: async (productId) => {
    try {
      const res = await api.get(`/downloads/${productId}`);
      if (res.data?.downloadUrl) return res;
    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 401) throw e;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');

    const prodSnap = await getDoc(doc(db, 'products', productId));
    if (!prodSnap.exists()) throw new Error('Product not found.');
    const prod = prodSnap.data();

    const isAdmin = currentUser.email?.toLowerCase() === 'admin@eproducts.com';
    const isSeller = prod.sellerId === currentUser.uid;
    if (isAdmin || isSeller) {
      return { data: { success: true, downloadUrl: prod.digitalFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' } };
    }

    const ordersQ = query(collection(db, 'orders'), where('buyerId', '==', currentUser.uid));
    const ordersSnap = await getDocs(ordersQ);
    let isBuyer = false;
    ordersSnap.forEach((d) => {
      const ord = d.data();
      if (ord.paymentStatus === 'completed' && Array.isArray(ord.items)) {
        if (ord.items.some((it) => (it.productId || it.id) === productId)) isBuyer = true;
      }
    });

    if (!isBuyer) {
      const err = new Error('Forbidden. You have not purchased this digital product.');
      err.response = { status: 403, data: { message: err.message } };
      throw err;
    }

    return { data: { success: true, downloadUrl: prod.digitalFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' } };
  }
};

// ==========================================
// 5. USER SERVICE
// ==========================================
export const userService = {
  getMe: async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data?.success) return res;
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: false, data: null } };

    try {
      const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDocSnap.exists() ? userDocSnap.data() : {};

      let totalPurchases = 0;
      let totalSpending = 0;
      try {
        const ordersQ = query(collection(db, 'orders'), where('buyerId', '==', currentUser.uid));
        const ordersSnap = await getDocs(ordersQ);
        ordersSnap.forEach((d) => {
          const ord = d.data();
          if (ord.paymentStatus === 'completed') {
            if (Array.isArray(ord.items)) totalPurchases += ord.items.length;
            totalSpending += Number(ord.totalAmount || 0);
          }
        });
      } catch (e) {}

      let totalUploadedProducts = 0;
      let totalSalesRevenue = 0;
      let totalItemsSold = 0;
      try {
        const prodsQ = query(collection(db, 'products'), where('sellerId', '==', currentUser.uid));
        const prodsSnap = await getDocs(prodsQ);
        totalUploadedProducts = prodsSnap.size || 0;
        prodsSnap.forEach((d) => {
          const p = d.data();
          const count = Number(p.salesCount || 0);
          const price = Number(p.price || 0);
          totalItemsSold += count;
          totalSalesRevenue += count * price;
        });
      } catch (e) {}

      const isAdminEmail = currentUser.email?.toLowerCase() === 'admin@eproducts.com';
      const role = isAdminEmail ? 'admin' : (userData.role || 'customer');

      return {
        data: {
          success: true,
          data: {
            uid: currentUser.uid,
            email: currentUser.email,
            name: userData.name || currentUser.displayName || currentUser.email?.split('@')[0],
            role,
            bio: userData.bio || '',
            avatar: userData.avatar || currentUser.photoURL || '',
            status: userData.status || 'active',
            createdAt: userData.createdAt || new Date().toISOString(),
            stats: {
              totalPurchases,
              totalSpending: Number(totalSpending.toFixed(2)),
              totalUploadedProducts,
              totalSalesRevenue: Number(totalSalesRevenue.toFixed(2)),
              totalItemsSold
            }
          }
        }
      };
    } catch (err) {
      return { data: { success: false, data: null } };
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put('/users/profile', data);
      if (res.data?.success) return res;
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated.');

    const userRef = doc(db, 'users', currentUser.uid);
    const updates = {};
    if (data.name) updates.name = data.name.trim();
    if (data.bio !== undefined) updates.bio = data.bio.trim();
    if (data.avatar) updates.avatar = data.avatar;
    if (data.phone) updates.phone = data.phone.trim();
    updates.updatedAt = new Date().toISOString();

    await setDoc(userRef, updates, { merge: true });
    if (data.name) updateFirebaseProfile(currentUser, { displayName: data.name }).catch(() => {});

    return {
      data: {
        success: true,
        message: 'Profile updated successfully!',
        data: { uid: currentUser.uid, email: currentUser.email, ...updates }
      }
    };
  }
};

// ==========================================
// 6. ADMIN SERVICE
// ==========================================
export const adminService = {
  getDashboard: async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data?.success) return res;
    } catch (e) {}

    try {
      const [prodsSnap, usersSnap, ordersSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders'))
      ]);

      let totalProducts = 0;
      let pendingProducts = 0;
      let approvedProducts = 0;
      prodsSnap.forEach((d) => {
        totalProducts++;
        const p = d.data();
        if (p.status === 'pending') pendingProducts++;
        if (p.status === 'approved' || !p.status) approvedProducts++;
      });

      const totalUsers = usersSnap.size || 0;
      let totalOrders = 0;
      let totalSales = 0;
      ordersSnap.forEach((d) => {
        totalOrders++;
        const ord = d.data();
        if (ord.paymentStatus === 'completed') totalSales += Number(ord.totalAmount || 0);
      });

      return {
        data: {
          success: true,
          data: { totalProducts, pendingProducts, approvedProducts, totalUsers, totalOrders, totalSales: Number(totalSales.toFixed(2)) }
        }
      };
    } catch (err) {
      throw err;
    }
  },

  getUsers: async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data?.success) return res;
    } catch (e) {}

    const snap = await getDocs(collection(db, 'users'));
    const users = [];
    snap.forEach((d) => {
      const u = d.data();
      delete u.password;
      users.push({ id: d.id, uid: d.id, ...u });
    });
    return { data: { success: true, count: users.length, data: users } };
  },

  updateUserStatus: async (id, status, role) => {
    try {
      const res = await api.put(`/admin/users/${id}/status`, { status, role });
      if (res.data?.success) return res;
    } catch (e) {}

    const updates = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (role) updates.role = role;
    await updateDoc(doc(db, 'users', id), updates);
    return { data: { success: true, message: 'User updated successfully.' } };
  },

  getProducts: async () => {
    try {
      const res = await api.get('/admin/products');
      if (res.data?.success) return res;
    } catch (e) {}

    const snap = await getDocs(collection(db, 'products'));
    const products = [];
    snap.forEach((d) => products.push({ id: d.id, ...d.data() }));
    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { data: { success: true, count: products.length, data: products } };
  },

  updateProductStatus: async (id, status) => {
    try {
      const res = await api.put(`/admin/products/${id}/status`, { status });
      if (res.data?.success) return res;
    } catch (e) {}

    await updateDoc(doc(db, 'products', id), { status, updatedAt: new Date().toISOString() });
    return { data: { success: true, message: `Product status updated to ${status}.` } };
  },

  deleteProduct: async (id) => {
    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res.data?.success) return res;
    } catch (e) {}

    await deleteDoc(doc(db, 'products', id));
    return { data: { success: true, message: 'Product deleted.' } };
  },

  getOrders: async () => {
    try {
      const res = await api.get('/admin/orders');
      if (res.data?.success) return res;
    } catch (e) {}

    const snap = await getDocs(collection(db, 'orders'));
    const orders = [];
    snap.forEach((d) => orders.push({ id: d.id, ...d.data() }));
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { data: { success: true, count: orders.length, data: orders } };
  },

  updateOrderStatus: async (id, orderStatus) => {
    try {
      const res = await api.put(`/admin/orders/${id}/status`, { orderStatus });
      if (res.data?.success) return res;
    } catch (e) {}

    await updateDoc(doc(db, 'orders', id), { orderStatus, updatedAt: new Date().toISOString() });
    return { data: { success: true, message: `Order status updated to ${orderStatus}.` } };
  },

  getAnalytics: async () => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data?.success) return res;
    } catch (e) {}

    const [prodsSnap, ordersSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'orders'))
    ]);

    const products = [];
    prodsSnap.forEach((d) => products.push({ id: d.id, ...d.data() }));

    const orders = [];
    ordersSnap.forEach((d) => orders.push({ id: d.id, ...d.data() }));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyMap[label] = { month: label, revenue: 0, orders: 0 };
    }

    orders.forEach((ord) => {
      if (ord.paymentStatus === 'completed' && ord.createdAt) {
        const d = new Date(ord.createdAt);
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        if (monthlyMap[label]) {
          monthlyMap[label].revenue += Number(ord.totalAmount || 0);
          monthlyMap[label].orders += 1;
        }
      }
    });

    const monthlySales = Object.values(monthlyMap);
    const catCount = {};
    products.forEach((p) => {
      const cat = p.category || 'General';
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catCount).map(([name, value]) => ({ name, value }));

    const mostViewed = [...products]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5)
      .map((p) => ({ name: p.name || p.title, views: p.viewCount || 0, category: p.category }));

    const topSelling = [...products]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 5)
      .map((p) => ({ name: p.name || p.title, sales: p.salesCount || 0, revenue: (p.salesCount || 0) * (Number(p.price) || 0) }));

    return { data: { success: true, data: { monthlySales, categoryDistribution, mostViewed, topSelling } } };
  }
};

export default api;
