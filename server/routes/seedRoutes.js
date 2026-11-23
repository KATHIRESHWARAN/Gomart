const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../scripts/seed');

// Seed route to populate sample products and demo accounts
router.post('/', async (req, res) => {
  try {
    const result = await seedDatabase();
    return res.status(200).json({
      success: true,
      message: 'Database seeded successfully with sample digital products, admin account, and orders.',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to seed database.',
      error: error.message
    });
  }
});

module.exports = router;
