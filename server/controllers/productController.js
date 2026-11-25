const { db } = require('../config/firebase');

// Valid product categories for modern e-commerce marketplace
const VALID_CATEGORIES = [
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
  'Books',
  // Official digital product categories
  'E-books',
  'Tutorials',
  'Study Materials',
  'Templates',
  'PDFs',
  'Design Resources',
  'Notes & Guides'
];

/**
 * Normalizes text for resilient matching across punctuation, plurals and variations
 */
const normalizeSearchText = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[-_.]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Normalizes tags from array or comma-separated string
 */
const extractSearchTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map(t => String(t).toLowerCase().trim()).filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags.split(/[,;\s]+/).map(t => t.toLowerCase().trim()).filter(Boolean);
  }
  return [];
};

/**
 * Matches a query against a product with tokenization, singular/plural tolerance, and relevance ranking
 */
const matchAndScoreProduct = (product, query) => {
  if (!query || !query.trim()) return { matches: true, score: 0 };

  const rawQuery = query.toLowerCase().trim();
  const normalizedQuery = normalizeSearchText(rawQuery);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  if (queryTokens.length === 0) return { matches: true, score: 0 };

  const name = (product.name || product.title || '').toLowerCase();
  const normalizedName = normalizeSearchText(name);
  const description = (product.description || '').toLowerCase();
  const normalizedDesc = normalizeSearchText(description);
  const category = (product.category || '').toLowerCase();
  const normalizedCat = normalizeSearchText(category);
  const brand = (product.brand || product.sellerName || '').toLowerCase();
  const normalizedBrand = normalizeSearchText(brand);
  const fileType = (product.fileType || product.format || '').toLowerCase();
  const tags = extractSearchTags(product.tags);
  const tagsString = tags.join(' ');
  const normalizedTags = normalizeSearchText(tagsString);

  // Category synonyms & variations (e.g. "ebook" matches "E-books", "pdf" matches "PDFs")
  const catAliases = [];
  if (normalizedCat.includes('book') || normalizedCat.includes('ebook')) catAliases.push('ebook', 'ebooks', 'book', 'books');
  if (normalizedCat.includes('tutorial')) catAliases.push('tutorial', 'tutorials', 'course', 'courses', 'video');
  if (normalizedCat.includes('study') || normalizedCat.includes('material')) catAliases.push('study', 'material', 'materials', 'exam', 'prep');
  if (normalizedCat.includes('template')) catAliases.push('template', 'templates', 'boilerplate', 'starter');
  if (normalizedCat.includes('pdf')) catAliases.push('pdf', 'pdfs', 'document');
  if (normalizedCat.includes('design') || normalizedCat.includes('resource')) catAliases.push('design', 'figma', 'ui', 'ux', 'icons', 'resources');
  if (normalizedCat.includes('note') || normalizedCat.includes('guide')) catAliases.push('notes', 'note', 'guide', 'guides', 'handbook', 'cheatsheet');
  const catAliasesString = catAliases.join(' ');

  const fullSearchable = `${normalizedName} ${normalizedDesc} ${normalizedCat} ${catAliasesString} ${normalizedBrand} ${normalizedTags} ${fileType}`;

  let tokenMatchCount = 0;
  let score = 0;

  for (const token of queryTokens) {
    const singular = token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token;
    const plural = `${token}s`;

    const tokenMatches = fullSearchable.includes(token) || 
                         fullSearchable.includes(singular) || 
                         fullSearchable.includes(plural);

    if (tokenMatches) {
      tokenMatchCount++;

      if (normalizedName === token || name === token) score += 100;
      else if (normalizedName.includes(token)) score += 40;
      else if (normalizedName.includes(singular)) score += 35;

      if (normalizedCat.includes(token) || catAliases.includes(token)) score += 30;
      if (tags.some(t => t.includes(token) || t.includes(singular))) score += 25;
      if (normalizedBrand.includes(token)) score += 15;
      if (fileType.includes(token)) score += 15;
      if (normalizedDesc.includes(token)) score += 5;
    }
  }

  // Exact phrase bonuses
  if (normalizedName.includes(normalizedQuery)) score += 60;
  if (normalizedTags.includes(normalizedQuery)) score += 40;
  if (normalizedCat.includes(normalizedQuery)) score += 35;

  const matches = (tokenMatchCount === queryTokens.length) || (score >= 20);
  return { matches, score };
};

/**
 * Get all approved products with filtering, search and sorting
 */
const getAllProducts = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      brand,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      sort, 
      status 
    } = req.query;

    const snapshot = await db.collection('products').get();
    let products = [];

    snapshot.forEach(doc => {
      const p = doc.data();
      products.push({ id: doc.id, ...p });
    });

    // Default to approved products for public marketplace
    const targetStatus = status || 'approved';
    if (targetStatus !== 'all') {
      products = products.filter(p => p.status === targetStatus);
    }

    // Filter by Category
    if (category && category !== 'All' && category !== 'all') {
      products = products.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }

    // Filter by Brand
    if (brand && brand !== 'All' && brand !== 'all') {
      const brandList = Array.isArray(brand) 
        ? brand.map(b => b.toLowerCase().trim()) 
        : brand.split(',').map(b => b.toLowerCase().trim());
      products = products.filter(p => p.brand && brandList.includes(p.brand.toLowerCase().trim()));
    }

    // Filter by Price range
    if (minPrice && !isNaN(Number(minPrice))) {
      products = products.filter(p => Number(p.price) >= Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      products = products.filter(p => Number(p.price) <= Number(maxPrice));
    }

    // Filter by Customer Rating
    if (minRating && !isNaN(Number(minRating))) {
      products = products.filter(p => Number(p.rating || 0) >= Number(minRating));
    }

    // Filter by Discount Percentage
    if (minDiscount && !isNaN(Number(minDiscount))) {
      products = products.filter(p => Number(p.discountPercent || 0) >= Number(minDiscount));
    }

    // Search query filter with tokenization, tag normalization, and relevance scoring
    if (search && search.trim() !== '') {
      const scoredProducts = [];
      for (const p of products) {
        const { matches, score } = matchAndScoreProduct(p, search);
        if (matches) {
          scoredProducts.push({ ...p, _searchScore: score });
        }
      }
      products = scoredProducts;
    }

    // Sorting
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
    } else if (search && search.trim() !== '') {
      // Prioritize highest relevance score first, then newest
      products.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      // Default: latest / new arrivals
      products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.',
      error: error.message
    });
  }
};

/**
 * Get single product by ID and track view count
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = doc.data();

    // Increment view count
    const currentViews = (product.viewCount || 0) + 1;
    await docRef.update({ viewCount: currentViews });

    // Track in productViews collection for analytics
    try {
      await db.collection('productViews').add({
        productId: id,
        productName: product.name || product.title,
        category: product.category,
        viewedAt: new Date().toISOString(),
        userAgent: req.headers['user-agent'] || 'unknown'
      });
    } catch (trackErr) {
      // Non-blocking view tracking error
    }

    return res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...product,
        viewCount: currentViews
      }
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product details.',
      error: error.message
    });
  }
};

/**
 * Create a new digital product
 */
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      title, 
      description, 
      price, 
      originalPrice,
      discountPercent,
      category, 
      brand,
      stockQuantity,
      images,
      colors,
      sizes,
      specifications,
      highlights,
      isAssured,
      fileType, 
      fileSize, 
      previewUrl, 
      tags 
    } = req.body;
    const productName = (name || title || '').trim();
    const productDesc = (description || '').trim() || 'Verified digital product deliverable with instant download access and licensing.';
    const productCat = (category || '').trim() || 'Templates';

    // Validation
    if (!productName || price === undefined || price === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide required product title and valid price.'
      });
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Product price must be a valid positive number.'
      });
    }

    let thumbnailUrl = req.body.thumbnailUrl || '';
    let digitalFileUrl = req.body.digitalFileUrl || '';

    // If uploaded via Multer
    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.digitalFile && req.files.digitalFile[0]) {
        digitalFileUrl = `/uploads/${req.files.digitalFile[0].filename}`;
      }
    }

    if (!thumbnailUrl) {
      thumbnailUrl = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
    }

    if (!digitalFileUrl) {
      digitalFileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    const calculatedOriginalPrice = originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.35);
    const calculatedDiscount = discountPercent 
      ? Number(discountPercent) 
      : Math.round(((calculatedOriginalPrice - Number(price)) / calculatedOriginalPrice) * 100);

    const newProduct = {
      name: productName,
      title: productName,
      description: productDesc,
      price: Number(price),
      originalPrice: calculatedOriginalPrice,
      discountPercent: calculatedDiscount > 0 ? calculatedDiscount : 0,
      category: productCat,
      brand: brand ? brand.trim() : 'E-Products Official',
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 50,
      inStock: stockQuantity !== undefined ? Number(stockQuantity) > 0 : true,
      images: Array.isArray(images) && images.length > 0 ? images : [thumbnailUrl],
      colors: Array.isArray(colors) ? colors : (colors ? [colors] : []),
      sizes: Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []),
      specifications: typeof specifications === 'object' && specifications !== null ? specifications : {},
      highlights: Array.isArray(highlights) ? highlights : [],
      isAssured: isAssured !== undefined ? Boolean(isAssured) : true,
      thumbnailUrl,
      digitalFileUrl,
      sellerId: req.user?.uid || 'verified_creator',
      sellerName: req.user?.name || req.user?.email?.split('@')[0] || 'Verified Creator',
      sellerEmail: req.user?.email || 'seller@eproducts.com',
      status: 'approved',
      viewCount: 0,
      salesCount: 0,
      rating: 4.8,
      reviewCount: 1,
      fileType: fileType || 'Digital Deliverable',
      fileSize: fileSize || '15.4 MB',
      previewUrl: previewUrl || '',
      tags: tags ? (Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim())) : [productCat],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Sanitize undefined fields to prevent Firestore serialization crashes
    Object.keys(newProduct).forEach(key => {
      if (newProduct[key] === undefined) {
        delete newProduct[key];
      }
    });

    const docRef = await db.collection('products').add(newProduct);

    return res.status(201).json({
      success: true,
      message: 'Product created and listed successfully!',
      data: {
        id: docRef.id,
        ...newProduct
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product.',
      error: error.message
    });
  }
};

/**
 * Update an existing product (Owner or Admin only)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = doc.data();

    // Verify ownership or admin
    if (product.sellerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit your own products.'
      });
    }

    const { name, title, description, price, category, thumbnailUrl, digitalFileUrl, status } = req.body;

    const updates = {};
    if (name || title) updates.name = updates.title = (name || title).trim();
    if (description) updates.description = description.trim();
    if (price !== undefined) updates.price = Number(price);
    if (category) updates.category = category.trim();
    if (thumbnailUrl) updates.thumbnailUrl = thumbnailUrl;
    if (digitalFileUrl) updates.digitalFileUrl = digitalFileUrl;
    
    // Only admin can change status directly via product update
    if (status && req.user.role === 'admin') {
      updates.status = status;
    }

    // If uploaded via Multer
    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        updates.thumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.digitalFile && req.files.digitalFile[0]) {
        updates.digitalFileUrl = `/uploads/${req.files.digitalFile[0].filename}`;
      }
    }

    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { id, ...product, ...updates }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product.',
      error: error.message
    });
  }
};

/**
 * Delete a product (Owner or Admin only)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = doc.data();

    if (product.sellerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only delete your own products.'
      });
    }

    await docRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
      error: error.message
    });
  }
};

/**
 * Get all products listed by the authenticated seller
 */
const getSellerProducts = async (req, res) => {
  try {
    const snapshot = await db.collection('products').where('sellerId', '==', req.user.uid).get();
    const products = [];

    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    // Sort by latest
    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your products.',
      error: error.message
    });
  }
};

/**
 * Get product categories
 */
const getCategories = (req, res) => {
  return res.status(200).json({
    success: true,
    data: VALID_CATEGORIES
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getCategories,
  VALID_CATEGORIES
};
