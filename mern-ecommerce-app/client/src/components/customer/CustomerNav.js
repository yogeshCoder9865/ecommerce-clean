// client/src/components/customer/CustomerNav.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assesets/logo.png';

const CustomerNav = () => {
    const { logout, impersonatingUser, exitImpersonation } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleExitImpersonation = async () => {
        const success = await exitImpersonation();
        if (success) {
            navigate('/admin'); // Redirect back to admin portal after exiting
        }
    };

    return (
        <div style={navContainerStyle}>
            {/* Logo and Website Name */}
            <div style={logoSectionStyle}>
                <img
                    src={logo} // Placeholder logo, can be changed
                    alt="Yogi Tech Logo"
                    style={logoImageStyle}
                />
                <h1 style={websiteNameStyle}>Yogi Tech</h1>
            </div>

            <ul style={navListStyle}>
                <li style={navItemStyle}>
                    <Link to="/" style={navLinkStyle}>
                        <i style={navIconStyle} className="fas fa-home"></i> Dashboard
                    </Link>
                </li>
                <li style={navItemStyle}>
                    <Link to="/products" style={navLinkStyle}>
                        <i style={navIconStyle} className="fas fa-box"></i> Browse Products
                    </Link>
                </li>
                <li style={navItemStyle}>
                    <Link to="/cart" style={navLinkStyle}>
                        <i style={navIconStyle} className="fas fa-shopping-cart"></i> My Cart
                    </Link>
                </li>
                <li style={navItemStyle}>
                    <Link to="/my-orders" style={navLinkStyle}>
                        <i style={navIconStyle} className="fas fa-clipboard-list"></i> My Orders
                    </Link>
                </li>
                <li style={navItemStyle}>
                    <Link to="/profile" style={navLinkStyle}>
                        <i style={navIconStyle} className="fas fa-user-circle"></i> My Profile
                    </Link>
                </li>
                <li style={navItemStyle}>
                    <button onClick={handleLogout} style={logoutButtonStyle}>
                        <i style={navIconStyle} className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </li>
            </ul>

            {impersonatingUser && (
                <div style={impersonationBannerStyle}>
                    <p style={impersonationTextStyle}>
                        Viewing as: <strong style={{ color: '#2c3e50' }}>{impersonatingUser.firstName} {impersonatingUser.lastName}</strong>
                    </p>
                    <button onClick={handleExitImpersonation} style={exitImpersonationButtonStyle}>
                        Exit Impersonation
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Inline Styles for Luxury and Premium UI with Animations ---

const navContainerStyle = {
    width: '280px', // Wider navigation
    backgroundColor: '#2c3e50', // Darker, premium background
    color: '#ecf0f1', // Light text color
    padding: '30px 0', // More vertical padding
    minHeight: '100vh',
    boxShadow: '5px 0 15px rgba(0,0,0,0.2)', // Stronger shadow
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'width 0.3s ease-in-out', // Smooth width transition if you add collapse functionality
};

const logoSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '40px',
    padding: '0 20px',
    animation: 'fadeInDown 0.6s ease-out', // Animation for logo section
};

const logoImageStyle = {
    width: '80px', // Larger logo
    height: '80px',
    borderRadius: '50%', // Circular logo
    marginBottom: '10px',
    border: '3px solid #3498db', // Accent border
    boxShadow: '0 0 15px rgba(52, 152, 219, 0.5)', // Glow effect
    transition: 'transform 0.3s ease-in-out',
    ':hover': {
        transform: 'scale(1.05)', // Slight scale on hover
    },
};

const websiteNameStyle = {
    fontSize: '2.2em', // Larger font size
    fontWeight: '800', // Extra bold
    color: '#3498db', // Vibrant accent color
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)', // Subtle text shadow
    letterSpacing: '1px',
};

const navListStyle = {
    listStyle: 'none',
    padding: 0,
    width: '100%',
};

const navItemStyle = {
    marginBottom: '10px', // Less space between items
    width: '100%',
    animation: 'slideInLeft 0.5s ease-out forwards', // Animation for each item
    opacity: 0, // Start invisible for animation
    transform: 'translateX(-20px)', // Start off-screen for animation
};

// Adjust animation delay for staggered effect
// This requires a dynamic style property or a CSS-in-JS library that supports it
// For now, it's a conceptual effect. In a real app, you'd iterate and set delay.
// Example: style={{ ...navItemStyle, animationDelay: `${index * 0.1}s` }}

const navLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 30px', // More padding for larger clickable area
    color: '#ecf0f1',
    textDecoration: 'none',
    fontSize: '1.1em',
    fontWeight: '500',
    transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.2s ease',
    borderRadius: '8px', // Rounded links
    margin: '0 15px', // Margin to keep rounded corners visible
    ':hover': {
        backgroundColor: '#34495e', // Darker background on hover
        color: '#3498db', // Accent color on hover
        transform: 'translateX(5px)', // Slight slide effect
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)', // Subtle shadow on hover
    },
    ':active': {
        transform: 'translateX(0)',
    },
};

const navIconStyle = {
    marginRight: '15px',
    fontSize: '1.2em',
    color: '#3498db', // Accent color for icons
};

const logoutButtonStyle = {
    ...navLinkStyle, // Inherit link styles
    width: 'auto', // Adjust width for button
    border: 'none',
    backgroundColor: 'transparent', // Make it transparent like a link
    cursor: 'pointer',
    justifyContent: 'flex-start', // Align text to start
    padding: '15px 30px', // Ensure padding is consistent
    color: '#e74c3c', // Red for logout
    ':hover': {
        backgroundColor: '#34495e',
        color: '#c0392b', // Darker red on hover
        transform: 'translateX(5px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
};

const impersonationBannerStyle = {
    marginTop: 'auto', // Pushes to the bottom
    padding: '20px',
    backgroundColor: '#f1c40f', // Warning yellow
    color: '#2c3e50',
    borderRadius: '10px',
    fontSize: '0.95em',
    fontWeight: '600',
    textAlign: 'center',
    width: 'calc(100% - 40px)', // Account for padding
    boxShadow: '0 4px 15px rgba(241, 196, 15, 0.4)',
    animation: 'fadeInUp 0.5s ease-out', // Animation for banner
};

const impersonationTextStyle = {
    marginBottom: '15px',
    lineHeight: '1.4',
};

const exitImpersonationButtonStyle = {
    background: '#e74c3c', // Red for exit
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)',
    ':hover': {
        backgroundColor: '#c0392b',
        transform: 'translateY(-2px)',
    },
};

// Keyframes for animations (add these to your client/src/index.css or a global stylesheet)
/*
@keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
}
*/
export default CustomerNav;