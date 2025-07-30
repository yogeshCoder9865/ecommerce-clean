// client/src/components/admin/AdminNav.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assesets/logo.png';

const AdminNav = () => {
    const { logout, impersonatingUser, exitImpersonation } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleExitImpersonation = async () => {
        const success = await exitImpersonation();
        if (success) {
            navigate('/admin'); // Go back to admin dashboard
        }
    };

    return (
        <div style={navContainerStyle}>
            <div style={brandSectionStyle}>
                <img src={logo} alt="Yogi Tech Logo" style={brandLogoStyle} />
                <h3 style={brandTitleStyle}>Yogi Tech Admin</h3>
            </div>

            <ul style={navListStyle}>
                <li style={navItemStyle}>
                    <Link to="/admin" style={navLinkStyle}>
                        <i className="fas fa-tachometer-alt" style={navIconStyle}></i> Dashboard
                    </Link>
                </li>
                <li style={navItemStyle}>
                    <Link to="/admin/products" style={navLinkStyle}>
                        <i className="fas fa-box-open" style={navIconStyle}></i> Products
                    </Link>
                </li>
                <li style={navItemStyle}>
                    <Link to="/admin/customers" style={navLinkStyle}>
                        <i className="fas fa-users" style={navIconStyle}></i> Customers
                    </Link>
                </li>
                <li style={navItemStyle}>
                    <Link to="/admin/orders" style={navLinkStyle}>
                        <i className="fas fa-shopping-basket" style={navIconStyle}></i> Orders
                    </Link>
                </li>
                <li style={navItemStyle}>
                    <Link to="/admin/settings" style={navLinkStyle}>
                        <i className="fas fa-cog" style={navIconStyle}></i> Settings
                    </Link>
                </li>
            </ul>

            <div style={logoutButtonContainerStyle}>
                <button onClick={handleLogout} style={logoutButtonStyle}>
                    <i className="fas fa-sign-out-alt" style={navIconStyle}></i> Logout
                </button>
            </div>

            {impersonatingUser && (
                <div style={impersonationAlertStyle}>
                    <p style={impersonationTextStyle}>
                        <i className="fas fa-user-secret" style={impersonationIconStyle}></i> Impersonating: <br />
                        <strong>{impersonatingUser.firstName} {impersonatingUser.lastName}</strong>
                    </p>
                    <button onClick={handleExitImpersonation} style={exitImpersonationButtonStyle}>
                        Exit Impersonation
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Inline Styles for Luxury and Premium UI ---
const navContainerStyle = {
    width: '280px', // Wider navigation for a more spacious feel
    backgroundColor: '#2c3e50', // Dark, rich background
    color: '#ecf0f1', // Light text color for contrast
    padding: '30px 20px',
    minHeight: '100vh',
    boxShadow: '5px 0 15px rgba(0,0,0,0.2)', // Subtle shadow to separate from content
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, Arial, sans-serif',
};

const brandSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '50px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)', // Subtle separator
};

const brandLogoStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    marginRight: '15px',
    border: '2px solid #3498db', // Accent color border
    boxShadow: '0 0 10px rgba(52, 152, 219, 0.5)', // Glow effect
};

const brandTitleStyle = {
    fontSize: '1.6em',
    fontWeight: '700',
    color: '#ecf0f1',
    letterSpacing: '0.5px',
    margin: 0,
};

const navListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    flexGrow: 1, // Allows nav list to take available space
};

const navItemStyle = {
    marginBottom: '15px',
    transition: 'transform 0.2s ease-out',
    ':hover': {
        transform: 'translateX(5px)', // Slight slide effect on hover
    },
};

const navLinkStyle = {
    color: '#ecf0f1',
    textDecoration: 'none',
    fontSize: '1.1em',
    padding: '12px 15px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
        backgroundColor: '#34495e', // Slightly lighter dark background on hover
        color: '#3498db', // Accent color text on hover
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    },
};

const navIconStyle = {
    marginRight: '12px',
    fontSize: '1.2em',
    color: '#95a5a6', // Subtle icon color
    transition: 'color 0.3s ease',
    ':hover': {
        color: '#3498db', // Change to accent color on hover
    },
};

const logoutButtonContainerStyle = {
    marginTop: 'auto', // Pushes logout button to the bottom
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
};

const logoutButtonStyle = {
    background: 'linear-gradient(45deg, #e74c3c, #c0392b)', // Gradient for a premium feel
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 15px rgba(231, 76, 60, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 20px rgba(231, 76, 60, 0.4)',
    },
    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)',
    },
};

const impersonationAlertStyle = {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f39c12', // Warm, alert-like color
    color: 'white',
    borderRadius: '10px',
    fontSize: '0.95em',
    fontWeight: '600',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(243, 156, 18, 0.4)',
    animation: 'pulse 1.5s infinite alternate', // Pulsing animation for attention
};

const impersonationTextStyle = {
    margin: '0 0 10px 0',
    lineHeight: '1.4',
};

const impersonationIconStyle = {
    marginRight: '8px',
    fontSize: '1.1em',
};

const exitImpersonationButtonStyle = {
    background: '#c0392b', // Darker red for exit
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: 'bold',
    marginTop: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    ':hover': {
        backgroundColor: '#a93226',
        transform: 'translateY(-1px)',
    },
};

// Keyframes for animations (ensure these are in your client/src/index.css or a global stylesheet)
/*
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-100%); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 15px rgba(243, 156, 18, 0.4); }
    50% { transform: scale(1.02); box-shadow: 0 0 25px rgba(243, 156, 18, 0.6); }
    100% { transform: scale(1); box-shadow: 0 0 15px rgba(243, 156, 18, 0.4); }
}
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
@keyframes zoomIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}
*/
export default AdminNav;