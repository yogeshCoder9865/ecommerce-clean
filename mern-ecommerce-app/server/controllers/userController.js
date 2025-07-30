// server/controllers/userController.js

const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

// @desc    Get all users (customers and admins for admin view)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin or owner
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (self or admin)
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res) => {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Admin can update any user's basic info
        if (req.user.role === 'admin' || req.user._id.toString() === user._id.toString()) {
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email; // Add logic for unique email check if changed

            // Handle password change for self
            if (newPassword) {
                if (!currentPassword || !(await user.matchPassword(currentPassword))) {
                    return res.status(401).json({ message: 'Invalid current password' });
                }
                user.password = newPassword; // Pre-save hook will hash this
            }

            user.updatedAt = Date.now();
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(403).json({ message: 'Not authorized to update this user' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Block/Unblock user
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot block/unblock yourself.' });
        }
        user.isActive = req.body.isActive;
        user.updatedAt = Date.now();
        await user.save();
        res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
const adminResetUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a simple temporary password (in a real app, send email)
        const tempPassword = Math.random().toString(36).slice(-8);
        user.password = tempPassword; // Pre-save hook will hash it
        user.updatedAt = Date.now();
        await user.save();

        res.json({ message: `Password reset successfully. New temporary password: ${tempPassword}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself as admin.' });
        }

        // Optional: Prevent deletion if user has existing orders
        const userOrders = await Order.countDocuments({ user: req.params.id });
        if (userOrders > 0) {
            return res.status(400).json({ message: 'Cannot delete user with existing orders.' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUserProfile,
    updateUserStatus,
    adminResetUserPassword,
    deleteUser
};