// =========================================================
// server/controllers/userController.js
// --- REFINED VERSION ---
// =========================================================
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

// @desc    Get all users (customers and admins for admin view)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin or owner
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile (self or admin)
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    console.log('--- Inside updateUserProfile Controller ---');
    console.log('Request Body:', req.body);
    // --- FIX START ---
    // The uploaded file details are available in req.file, not req.body
    console.log('Uploaded File:', req.file);
    // --- FIX END ---
    
    // De-structure text fields from req.body
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Admin can update any user's basic info, or user can update their own profile
    if (req.user.role === 'admin' || req.user._id.toString() === user._id.toString()) {
        // Check if email is being changed and if it's already taken by another user
        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({ email });
            if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
                res.status(400);
                throw new Error('Email is already taken by another user');
            }
            user.email = email;
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        
        // --- FIX START ---
        // Handle the profile picture upload
        if (req.file) {
            // Multer saves the file path to req.file.path.
            // We save a relative path to the database to be used on the client.
            // The replace is for cross-platform compatibility (Windows uses \ vs /)
            user.imageUrl = '/' + req.file.path.replace(/\\/g, '/');
        }
        // --- FIX END ---

        // Handle password change for self
        if (newPassword) {
            if (!currentPassword || !(await user.matchPassword(currentPassword))) {
                res.status(401);
                throw new Error('Invalid current password');
            }
            user.password = newPassword; // Pre-save hook will hash this
        }

        user.updatedAt = Date.now();
        const updatedUser = await user.save();

        // --- FIX START ---
        // Ensure the imageUrl is included in the response so the client can update its state
        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
            imageUrl: updatedUser.imageUrl, // <-- ADDED THIS LINE
        });
        // --- FIX END ---
    } else {
        res.status(403);
        throw new Error('Not authorized to update this user');
    }
});

// @desc    Admin: Block/Unblock user
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot block/unblock yourself.');
    }
    user.isActive = req.body.isActive;
    user.updatedAt = Date.now();
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
});

// @desc    Admin: Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
const adminResetUserPassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate a simple temporary password (in a real app, send email)
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword; // Pre-save hook will hash it
    user.updatedAt = Date.now();
    await user.save();

    res.json({ message: `Password reset successfully. New temporary password: ${tempPassword}` });
});

// @desc    Admin: Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot delete yourself as admin.');
    }

    const userOrders = await Order.countDocuments({ user: req.params.id });
    if (userOrders > 0) {
        res.status(400);
        throw new Error('Cannot delete user with existing orders.');
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
});

module.exports = {
    getUsers,
    getUserById,
    updateUserProfile,
    updateUserStatus,
    adminResetUserPassword,
    deleteUser
};