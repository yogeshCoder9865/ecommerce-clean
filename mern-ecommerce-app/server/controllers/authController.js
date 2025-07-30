const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Ensure your User model path is correct
const generateToken = require('../utils/generateToken'); // Ensure your generateToken utility path is correct

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        firstName,
        lastName,
        email,
        password, // Password will be hashed by pre-save hook in User model
        role: 'customer' // Default role for new registrations
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role), // Generate token for the new user
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    // Check password
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive, // Include isActive status
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get current authenticated user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // req.user is set by the 'protect' middleware after verifying the token
    if (req.user) {
        res.status(200).json({
            _id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role,
            isActive: req.user.isActive, // Include isActive status
            // Potentially add isImpersonating flag if stored in token or user object
        });
    } else {
        res.status(404).json({ message: 'User data not found' });
    }
});


// @desc    Admin impersonates a customer
// @route   POST /api/auth/impersonate/:customerId
// @access  Private/Admin
const impersonateUser = asyncHandler(async (req, res) => {
    // Ensure the requesting user is an admin
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to impersonate users');
    }

    const customerId = req.params.customerId;
    const customer = await User.findById(customerId);

    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    if (customer.role !== 'customer') {
        res.status(400);
        throw new Error('Can only impersonate users with "customer" role.');
    }

    // Generate a new token for the customer, but include a flag
    // and the original admin's ID/role in the payload for exit impersonation
    const impersonationToken = generateToken(
        customer._id,
        customer.role,
        {
            isImpersonating: true,
            originalAdminId: req.user._id,
            originalAdminRole: req.user.role
        }
    );

    res.json({
        message: `Successfully impersonated ${customer.email}`,
        token: impersonationToken,
        user: { // Return the impersonated user's basic details
            _id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            role: customer.role,
            isActive: customer.isActive,
            isImpersonating: true // Flag for frontend
        }
    });
});

// @desc    Admin exits impersonation
// @route   POST /api/auth/exit-impersonation
// @access  Private/Admin (or authenticated user with impersonation token)
const exitImpersonation = asyncHandler(async (req, res) => {
    // The 'protect' middleware should have already verified the token
    // and populated req.user with the impersonated user's details (which includes originalAdminId)
    if (!req.user || !req.user.isImpersonating || !req.user.originalAdminId) {
        res.status(400);
        throw new Error('Not currently impersonating a user.');
    }

    const originalAdmin = await User.findById(req.user.originalAdminId);

    if (!originalAdmin || originalAdmin.role !== req.user.originalAdminRole) {
        res.status(404);
        throw new Error('Original admin not found or role mismatch. Cannot exit impersonation.');
    }

    // Generate a new token for the original admin
    const adminToken = generateToken(originalAdmin._id, originalAdmin.role);

    res.json({
        message: 'Exited impersonation successfully.',
        token: adminToken,
        user: { // Return the original admin's basic details
            _id: originalAdmin._id,
            firstName: originalAdmin.firstName,
            lastName: originalAdmin.lastName,
            email: originalAdmin.email,
            role: originalAdmin.role,
            isActive: originalAdmin.isActive,
            isImpersonating: false // Flag for frontend
        }
    });
});


module.exports = {
    registerUser,
    loginUser,
    getMe, // Ensure getMe is exported
    impersonateUser,
    exitImpersonation
};
