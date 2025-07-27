// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    console.log('--- Incoming Request to Protect Middleware ---');
    console.log('Request Method:', req.method); // Log the HTTP method
    console.log('Request URL:', req.originalUrl); // Log the URL

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token extracted:', token ? 'YES' : 'NO'); // Check if token is extracted
            if (!token) {
                 console.log('No token after split, sending 401.');
                 return res.status(401).json({ message: 'Not authorized, no token' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user || !req.user.isActive) {
                console.log('User inactive or not found after token verification.');
                return res.status(401).json({ message: 'Not authorized, user inactive or not found' });
            }
            // If impersonating, store original user ID in req.user
            if (decoded.isImpersonating && decoded.originalUserId) {
                req.user.isImpersonating = true;
                req.user.originalUserId = decoded.originalUserId;
            }
            console.log('User authenticated:', req.user.email, 'Role:', req.user.role); // Log authenticated user
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message); // Log specific JWT error
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('Authorization header missing or not starting with Bearer.');
    }

    if (!token) {
        console.log('Final check: Token is still missing, sending 401.');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log('--- Authorize Roles Middleware ---');
        console.log('Required roles:', roles);
        console.log('User role:', req.user ? req.user.role : 'N/A (user not set)');
        if (!req.user || !roles.includes(req.user.role)) {
            console.log('User not authorized for this role.');
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };