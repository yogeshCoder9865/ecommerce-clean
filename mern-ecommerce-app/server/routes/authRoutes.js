// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
// ADD getMe here VVVVVVV
const { registerUser, loginUser, getMe, impersonateUser, exitImpersonation } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Ensure authorizeRoles is defined in authMiddleware

router.post('/register', registerUser);
router.post('/login', loginUser);

// This is the route that was giving 404
router.get('/me', protect, getMe);

// Make sure you have authorizeRoles imported and defined in authMiddleware.js
router.post('/impersonate/:customerId', protect, authorizeRoles('admin'), impersonateUser);
router.post('/exit-impersonation', protect, exitImpersonation);

module.exports = router;