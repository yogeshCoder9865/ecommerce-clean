// client/src/pages/common/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for "Register here" and "Forgot Password"
import logo from '../../assesets/logo.png'; // Reverted: 'assesets' as per user's folder structure

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // State for loading indicator
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setLoading(true); // Set loading state

        try {
            const loggedInUser = await login(email, password); // This function should now throw an error on failure

            if (loggedInUser) {
                if (loggedInUser.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                // This 'else' block should ideally not be hit if 'login' always throws on failure.
                // It's a fallback, but the 'catch' block below is more robust for Axios errors.
                setError('Login failed. Please check your credentials.');
                console.log('Error state set (fallback):', 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login attempt failed:', err);
            let errorMessage = 'Login failed. Please try again later.'; // Generic fallback

            // Check for specific Axios error status (e.g., 401 for unauthorized)
            if (err.response && err.response.status === 401) {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (err.response && err.response.data && err.response.data.message) {
                // Use a more specific error message from the backend if available
                errorMessage = err.response.data.message;
            }
            setError(errorMessage);
            console.log('Error state set (catch block):', errorMessage); // Log the error being set
        } finally {
            setLoading(false); // Always reset loading state
        }
    };

    // --- Inline Styles for Luxury and Premium UI with Animations ---

    const pageContainerStyle = {
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        backgroundColor: '#f0f2f5', // Light background for the whole page
        fontFamily: 'Inter, Arial, sans-serif',
        overflow: 'hidden', // Hide overflow for animations
        borderRadius: '20px', // Overall rounded container
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)', // Deep shadow for the whole block
        margin: '30px auto', // Center the entire block
        maxWidth: '1200px', // Max width for the split layout
        width: '95%', // Responsive width
    };

    const promoSectionStyle = {
        flex: 1,
        backgroundColor: '#4070f4', // Vibrant blue from the image
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        color: 'white',
        borderRadius: '20px 0 0 20px', // Rounded only on the left side
        animation: 'slideInLeft 0.8s ease-out', // Animation for the promo section
        position: 'relative',
        overflow: 'hidden', // For any background effects
    };

    const promoContentStyle = {
        textAlign: 'center',
        maxWidth: '450px',
        zIndex: 1, // Ensure content is above any background effects
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
        animation: 'zoomIn 0.8s ease-out 0.4s forwards', // Staggered animation
        opacity: 0, // Start invisible
        transform: 'scale(0.8)', // Start smaller
    };

    const loginSectionStyle = {
        flex: 1,
        backgroundColor: '#ffffff', // White background for login form
        padding: '50px 40px',
        borderRadius: '0 20px 20px 0', // Rounded only on the right side
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)', // Softer shadow for login section
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'slideInRight 0.8s ease-out', // Animation for the login section
    };

    const loginHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '30px',
        animation: 'fadeInDown 0.6s ease-out',
    };

    const logoImageStyle = {
        width: '40px', // Smaller logo for login section
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
    };

    const formStyle = {
        width: '100%',
        maxWidth: '350px', // Max width for the form elements
    };

    const formGroupStyle = {
        marginBottom: '20px',
        textAlign: 'left',
        position: 'relative', // For forgot password link positioning
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
        ':focus': {
            borderColor: '#3498db',
            boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)',
            outline: 'none',
        },
    };

    const forgotPasswordLinkStyle = {
        position: 'absolute',
        right: '0',
        top: '0', // Adjust this if needed to align with label
        fontSize: '0.85em',
        color: '#3498db',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.2s ease',
        ':hover': {
            color: '#2980b9',
            textDecoration: 'underline',
        },
    };

    const loginButtonStyle = {
        width: '100%',
        padding: '15px 25px',
        backgroundColor: '#4070f4', // Blue from promo section
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: 'bold',
        marginTop: '20px',
        transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
        boxShadow: '0 6px 15px rgba(64, 112, 244, 0.3)',
        ':hover': {
            backgroundColor: '#3360e0',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(64, 112, 244, 0.4)',
        },
        ':active': {
            transform: 'translateY(0)',
            boxShadow: '0 4px 10px rgba(64, 112, 244, 0.3)',
        },
        ':disabled': { // Style for disabled state
            backgroundColor: '#a0c8f5',
            cursor: 'not-allowed',
            boxShadow: 'none',
            transform: 'none', // Ensure no transform on disabled state
        },
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
        color: '#4285F4', // Google blue
        ':hover': {
            backgroundColor: '#f5f5f5',
            borderColor: '#4285F4',
            boxShadow: '0 2px 10px rgba(66, 133, 244, 0.2)',
        },
    };

    const socialButtonFacebookStyle = {
        ...socialButtonBaseStyle,
        backgroundColor: 'white',
        color: '#1877F2', // Facebook blue
        ':hover': {
            backgroundColor: '#f5f5f5',
            borderColor: '#1877F2',
            boxShadow: '0 2px 10px rgba(24, 119, 242, 0.2)',
        },
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
        ':hover': {
            textDecoration: 'underline',
        },
    };

    const adminDemoStyle = {
        marginTop: '15px',
        fontSize: '0.85em',
        color: '#7f8c8d',
    };

    return (
        <div style={pageContainerStyle}>
            {/* Left Promotional Section */}
            <div style={promoSectionStyle}>
                <div style={promoContentStyle}>
                    <h2 style={promoTitleStyle}>Simplify Management With Our Dashboard.</h2>
                    <p style={promoTaglineStyle}>
                        Simplify your e-commerce management with our user-friendly admin dashboard.
                    </p>
                    <img
                        src="https://placehold.co/300x200/4070f4/FFFFFF?text=Characters" // Placeholder for characters image
                        alt="Management Characters"
                        style={promoImageStyle}
                    />
                </div>
            </div>

            {/* Right Login Form Section */}
            <div style={loginSectionStyle}>
                {/* Logo and Website Name at the top of the login section */}
                <div style={loginHeaderStyle}>
                    <img
                        src={logo} // Customizable logo URL
                        alt="Yogi Tech Logo"
                        style={logoImageStyle}
                    />
                    <h1 style={websiteNameStyle}>Yogi Tech</h1>
                </div>

                <h2 style={formTitleStyle}>Welcome Back</h2>
                <p style={subTitleStyle}>Please login to your account</p>
                {error && <p key={error} style={errorMessageStyle}>{error}</p>} {/* Added key for better re-rendering */}
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
                    <button type="submit" style={loginButtonStyle} disabled={loading}>
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
                {/* <p style={adminDemoStyle}>
                    Admin Demo: <strong>admin@example.com</strong> / <strong>admin123</strong>
                </p> */}
            </div>
        </div>
    );
};

export default LoginPage;
