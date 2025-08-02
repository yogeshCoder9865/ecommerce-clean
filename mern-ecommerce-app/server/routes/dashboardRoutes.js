// server/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStatistics } = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Route to get dashboard statistics
// Accessible only by authenticated users with 'admin' role
router.get('/statistics', protect, authorizeRoles('admin'), getDashboardStatistics);

module.exports = router;
