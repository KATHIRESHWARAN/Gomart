const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const { verifyToken } = require('../middleware/authMiddleware');

// Secure digital product download
router.get('/:productId', verifyToken, downloadController.downloadProduct);

module.exports = router;
