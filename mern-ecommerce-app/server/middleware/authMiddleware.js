// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Not authorized, no token' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // 👈 this might throw 'TokenExpiredError'

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user || !req.user.isActive) {
                return res.status(401).json({ message: 'Not authorized, user inactive or not found' });
            }

            // Add impersonation logic if needed
            if (decoded.isImpersonating) {
                req.user.isImpersonating = true;
                req.user.originalAdminId = decoded.originalUserId;
            }

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Session expired. Please log in again.' });
            }

            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};


const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // console.log('--- Authorize Roles Middleware ---');
        // console.log('Required roles:', roles);
        // console.log('User role:', req.user ? req.user.role : 'N/A (user not set)');
        if (!req.user || !roles.includes(req.user.role)) {
            // console.log('User not authorized for this role.');
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
