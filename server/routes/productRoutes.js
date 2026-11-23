const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Safe Multer upload middleware to catch upload errors before controller
const safeUploadFields = (fields) => {
  const uploadMiddleware = upload.fields(fields);
  return (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    // If request is pure JSON, bypass multer so express.json() parses body cleanly
    if (!contentType.includes('multipart/form-data')) {
      return next();
    }
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds maximum allowed limit (50MB).'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error.'
        });
      }
      next();
    });
  };
};

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);

// Seller routes (authenticated)
router.get('/seller/my-products', verifyToken, productController.getSellerProducts);

// Product details
router.get('/:id', productController.getProductById);

// Create product (with optional file uploads)
router.post(
  '/',
  verifyToken,
  safeUploadFields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'digitalFile', maxCount: 1 }
  ]),
  productController.createProduct
);

// Update product
router.put(
  '/:id',
  verifyToken,
  safeUploadFields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'digitalFile', maxCount: 1 }
  ]),
  productController.updateProduct
);

// Delete product
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;
