// server/routes/userRoutes.js 
 const express = require('express'); 
 const router = express.Router(); 
 const { 
    getUsers, 
    getUserById, 
    updateUserProfile, 
    updateUserStatus, 
    adminResetUserPassword, 
    deleteUser 
 } = require('../controllers/userController'); 
 const { protect, authorizeRoles } = require('../middleware/authMiddleware'); 

 // Admin-only routes for managing all users 
 router.route('/') 
    .get(protect, authorizeRoles('admin'), getUsers); 

 router.route('/:id') 
    .get(protect, getUserById) // Admins can view any user, user can view their own profile 
    .put(protect, updateUserProfile) // Users can update self, admins can update any user 
    .delete(protect, authorizeRoles('admin'), deleteUser); // Admin only 

 router.put('/:id/status', protect, authorizeRoles('admin'), updateUserStatus); // Admin only 
 router.put('/:id/reset-password', protect, authorizeRoles('admin'), adminResetUserPassword); // Admin only 

 module.exports = router;