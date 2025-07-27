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
            token: generateToken(user._id, user.role),
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
        });
    } else {
        res.status(404).json({ message: 'User data not found' });
    }
});


// @desc    Admin impersonates a customer
// @route   POST /api/auth/impersonate/:customerId
// @access  Private/Admin
const impersonateUser = asyncHandler(async (req, res) => {
    // Placeholder for impersonation logic
    // This would typically involve:
    // 1. Verifying the admin's token (done by 'protect' and 'authorizeRoles').
    // 2. Finding the customer by customerId.
    // 3. Generating a new JWT token for the *customer's* _id and role.
    // 4. Sending back this new token and the impersonated user's details.
    // 5. You might also want to include the original admin's details (or a flag) in the response
    //    so the frontend knows to display an "Exit Impersonation" button.
    res.status(501).json({ message: 'Impersonation not yet implemented in backend.' });
});

// @desc    Admin exits impersonation
// @route   POST /api/auth/exit-impersonation
// @access  Private/Admin
const exitImpersonation = asyncHandler(async (req, res) => {
    // Placeholder for exit impersonation logic
    // This would typically involve:
    // 1. Verifying the temporary (impersonation) token.
    // 2. Retrieving the original admin's ID (which might be stored in the impersonation token's payload).
    // 3. Generating a new token for the original admin.
    // 4. Sending back this new token and the original admin's details.
    res.status(501).json({ message: 'Exit impersonation not yet implemented in backend.' });
});


module.exports = {
    registerUser,
    loginUser,
    getMe, // Ensure getMe is exported
    impersonateUser,
    exitImpersonation
};