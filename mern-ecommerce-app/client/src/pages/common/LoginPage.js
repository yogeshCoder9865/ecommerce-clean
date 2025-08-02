// client/src/pages/common/LoginPage.js
// I've refined the error handling in the `handleSubmit` function.

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assesets/logo.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const loggedInUser = await login(email, password);

            if (loggedInUser) {
                if (loggedInUser.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            // Log the full error for debugging purposes. This is expected.
            console.error('Login attempt failed:', err.response || err);

            // --- REFINED ERROR HANDLING ---
            // This logic now robustly extracts the error message sent from your backend.
            // If your backend sends a { message: '...' } object on error, this will display it.
            const message =
                (err.response &&
                    err.response.data &&
                    err.response.data.message) ||
                'Invalid credentials. Please check your email and password.';

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // --- All inline styles remain the same ---
    const pageContainerStyle = {
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Inter, Arial, sans-serif',
        overflow: 'hidden',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
        margin: '30px auto',
        maxWidth: '1200px',
        width: '95%',
    };

    const promoSectionStyle = {
        flex: 1,
        backgroundColor: '#4070f4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        color: 'white',
        borderRadius: '20px 0 0 20px',
        animation: 'slideInLeft 0.8s ease-out',
        position: 'relative',
        overflow: 'hidden',
    };

    const promoContentStyle = {
        textAlign: 'center',
        maxWidth: '450px',
        zIndex: 1,
    };

    const promoTitleStyle = {
        fontSize: '2.8em',
        fontWeight: '800',
        marginBottom: '20px',
        lineHeight: '1.2',
        textShadow: '2px 2px 5px rgba(0,0,0,0.2)',
    };

    const promoTaglineStyle = {
        fontSize: '1.1em',
        lineHeight: '1.6',
        marginBottom: '30px',
        opacity: 0.9,
    };

    const promoImageStyle = {
        width: '100%',
        maxWidth: '350px',
        height: 'auto',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        animation: 'zoomIn 0.8s ease-out 0.4s forwards',
        opacity: 0,
        transform: 'scale(0.8)',
    };

    const loginSectionStyle = {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: '50px 40px',
        borderRadius: '0 20px 20px 0',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'slideInRight 0.8s ease-out',
    };

    const loginHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '30px',
        animation: 'fadeInDown 0.6s ease-out',
    };

    const logoImageStyle = {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '15px',
        border: '2px solid #3498db',
    };

    const websiteNameStyle = {
        fontSize: '1.8em',
        fontWeight: '800',
        color: '#2c3e50',
        letterSpacing: '0.5px',
    };

    const formTitleStyle = {
        color: '#2c3e50',
        fontSize: '2.5em',
        marginBottom: '10px',
        fontWeight: '700',
        textAlign: 'center',
    };

    const subTitleStyle = {
        color: '#7f8c8d',
        fontSize: '1em',
        marginBottom: '30px',
        textAlign: 'center',
    };

    const errorMessageStyle = {
        color: '#e74c3c',
        backgroundColor: '#fde7e7',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '25px',
        fontSize: '0.95em',
        fontWeight: 'bold',
        border: '1px solid #e74c3c',
        animation: 'shake 0.5s ease-in-out',
        width: '100%',
        maxWidth: '350px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    };

    const formStyle = {
        width: '100%',
        maxWidth: '350px',
    };

    const formGroupStyle = {
        marginBottom: '20px',
        textAlign: 'left',
        position: 'relative',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#555',
        fontSize: '0.95em',
    };

    const inputStyle = {
        width: 'calc(100% - 24px)',
        padding: '12px',
        border: '1px solid #cfd8dc',
        borderRadius: '8px',
        fontSize: '1em',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    };

    const forgotPasswordLinkStyle = {
        position: 'absolute',
        right: '0',
        top: '0',
        fontSize: '0.85em',
        color: '#3498db',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.2s ease',
    };

    const loginButtonStyle = {
        width: '100%',
        padding: '15px 25px',
        backgroundColor: '#4070f4',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: 'bold',
        marginTop: '20px',
        transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
        boxShadow: '0 6px 15px rgba(64, 112, 244, 0.3)',
    };
    
    const disabledLoginButtonStyle = {
        ...loginButtonStyle,
        backgroundColor: '#a0c8f5',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    };

    const orDividerStyle = {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '350px',
        margin: '30px 0',
    };

    const orLineStyle = {
        flexGrow: 1,
        height: '1px',
        backgroundColor: '#ddd',
    };

    const orTextStyle = {
        margin: '0 15px',
        color: '#888',
        fontSize: '0.9em',
        fontWeight: '500',
    };

    const socialLoginContainerStyle = {
        display: 'flex',
        gap: '15px',
        width: '100%',
        maxWidth: '350px',
        marginBottom: '30px',
    };

    const socialButtonBaseStyle = {
        flex: 1,
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
    };

    const socialButtonGoogleStyle = {
        ...socialButtonBaseStyle,
        backgroundColor: 'white',
        color: '#4285F4',
    };

    const socialButtonFacebookStyle = {
        ...socialButtonBaseStyle,
        backgroundColor: 'white',
        color: '#1877F2',
    };

    const socialIconStyle = {
        marginRight: '8px',
        fontSize: '1.1em',
    };

    const registerLinkStyle = {
        marginTop: '20px',
        fontSize: '0.95em',
        color: '#666',
    };

    const linkStyle = {
        color: '#3498db',
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: 'color 0.3s ease',
    };

    return (
        <div style={pageContainerStyle}>
            <div style={promoSectionStyle}>
                <div style={promoContentStyle}>
                    <h2 style={promoTitleStyle}>Simplify Management With Our Dashboard.</h2>
                    <p style={promoTaglineStyle}>
                        Simplify your e-commerce management with our user-friendly admin dashboard.
                    </p>
                    <img
                        src="http://localhost:5000/uploads/6885e93ad83e54519f4a5c4a-1753947720652.png"
                        alt="Management Characters"
                        style={promoImageStyle}
                    />
                </div>
            </div>

            <div style={loginSectionStyle}>
                <div style={loginHeaderStyle}>
                    <img
                        src={logo}
                        alt="Yogi Tech Logo"
                        style={logoImageStyle}
                    />
                    <h1 style={websiteNameStyle}>Yogi Tech</h1>
                </div>

                <h2 style={formTitleStyle}>Welcome Back</h2>
                <p style={subTitleStyle}>Please login to your account</p>
                
                {error && (
                    <p key={error} style={errorMessageStyle}>
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={formGroupStyle}>
                        <label htmlFor="email" style={labelStyle}>Email address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="your.email@example.com"
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="password" style={labelStyle}>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="••••••••"
                        />
                        <Link to="/forgot-password" style={forgotPasswordLinkStyle}>Forgot Password?</Link>
                    </div>
                    <button type="submit" style={loading ? disabledLoginButtonStyle : loginButtonStyle} disabled={loading}>
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <div style={orDividerStyle}>
                    <span style={orLineStyle}></span>
                    <span style={orTextStyle}>Or Login With</span>
                    <span style={orLineStyle}></span>
                </div>

                <div style={socialLoginContainerStyle}>
                    <button style={socialButtonGoogleStyle}>
                        <i className="fab fa-google" style={socialIconStyle}></i> Google
                    </button>
                    <button style={socialButtonFacebookStyle}>
                        <i className="fab fa-facebook-f" style={socialIconStyle}></i> Facebook
                    </button>
                </div>

                <p style={registerLinkStyle}>
                    Don't have an account? <Link to="/register" style={linkStyle}>Signup</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;


// ----------------------------------------------------------------
// --- Backend Files (for context, no changes needed) ---
// ----------------------------------------------------------------

/*
// server/controllers/authController.js (NO CHANGES)
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = asyncHandler(async (req, res) => {
    // ... (code as provided)
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

const getMe = asyncHandler(async (req, res) => {
    // ... (code as provided)
});

const impersonateUser = asyncHandler(async (req, res) => {
    // ... (code as provided)
});

const exitImpersonation = asyncHandler(async (req, res) => {
    // ... (code as provided)
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    impersonateUser,
    exitImpersonation
};

// server/routes/authRoutes.js (NO CHANGES)
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, impersonateUser, exitImpersonation } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/impersonate/:customerId', protect, authorizeRoles('admin'), impersonateUser);
router.post('/exit-impersonation', protect, exitImpersonation);

module.exports = router;
*/
