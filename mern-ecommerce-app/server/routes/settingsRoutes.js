// server/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
    .get(getSettings) // Publicly accessible for client to get branding
    .put(protect, authorizeRoles('admin'), updateSettings); // Admin only

module.exports = router;