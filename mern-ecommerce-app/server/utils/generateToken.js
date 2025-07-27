// server/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id, role, isImpersonating = false, originalUserId = null) => {
    const payload = { id, role };
    if (isImpersonating) {
        payload.isImpersonating = true;
        payload.originalUserId = originalUserId; // Store original admin ID
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = generateToken;