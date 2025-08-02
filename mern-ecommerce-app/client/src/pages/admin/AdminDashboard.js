// client/src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../../components/admin/AdminNav';
import logo from '../../assesets/logo.png'; // Corrected typo: assets

const AdminDashboard = () => {
    const { user, logout, authAxios } = useAuth();
    const navigate = useNavigate();
    // Initialize stats with expected structure from the backend /dashboard/statistics endpoint
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: '0.00', // Backend sends this as a string, keep it consistent
        pendingOrders: 0,
        ordersByStatus: {} // This will be derived or added if needed, but not directly from the main stats API
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardStatistics = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch all dashboard statistics from the dedicated backend endpoint
                const res = await authAxios.get('/dashboard/statistics');

                // The backend /dashboard/statistics endpoint returns an object like:
                // { totalUsers: N, totalOrders: M, totalRevenue: "X.XX", pendingOrders: P }
                // We map these to our frontend state.
                setStats({
                    totalProducts: res.data.totalProducts || 0, // Assuming backend also provides this or we fetch separately if needed
                    totalCustomers: res.data.totalUsers || 0, // Backend calls it totalUsers
                    totalOrders: res.data.totalOrders || 0,
                    totalRevenue: res.data.totalRevenue || '0.00',
                    pendingOrders: res.data.pendingOrders || 0,
                    // If you still need orders by status, you'd need a separate endpoint for that
                    // or modify the backend /dashboard/statistics to include it.
                    // For now, we'll initialize it as empty or calculate from totalOrders/pendingOrders
                    ordersByStatus: {
                        'Pending': res.data.pendingOrders || 0,
                        'Delivered': (res.data.totalOrders || 0) - (res.data.pendingOrders || 0) // Simple approximation
                    }
                });
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                // Check for specific error messages from backend
                const errorMessage = err.response && err.response.data && err.response.data.message
                                     ? err.response.data.message
                                     : 'Failed to load dashboard statistics. Please try again.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStatistics();
    }, [authAxios]); // Re-fetch when authAxios (and thus token) changes

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper for Status Colors (re-used from other admin/customer pages)
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#ffc107'; // Yellow/Orange
            case 'Processing': return '#007bff'; // Blue
            case 'Shipped': return '#17a2b8'; // Teal
            case 'Delivered': return '#28a745'; // Green
            case 'Cancelled': return '#dc3545'; // Red
            default: return '#6c757d'; // Grey
        }
    };

    if (loading) {
        return (
            <div style={fullPageLoadingContainerStyle}>
                <div style={spinnerStyle}></div>
                <p style={{ color: '#555', marginTop: '20px', fontSize: '1.2em' }}>Loading Admin Dashboard...</p>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <div style={accessDeniedContainerStyle}>
                <h2 style={accessDeniedTitleStyle}>Access Denied</h2>
                <p style={accessDeniedMessageStyle}>You do not have administrative privileges to view this page.</p>
                <button onClick={() => navigate('/')} style={goHomeButtonStyle}>Go to Home</button>
            </div>
        );
    }

    return (
        <div style={pageContainerStyle}>
            <AdminNav />
            <div style={contentAreaStyle}>
                <div style={headerContainerStyle}>
                    <div style={brandContainerStyle}>
                        <img src={logo} alt="Yogi Tech Logo" style={brandLogoStyle} />
                        <h1 style={brandNameStyle}>Yogi Tech Admin</h1>
                    </div>
                    <h2 style={pageTitleStyle}>Dashboard Overview</h2>
                </div>

                {error && <p style={errorMessageStyle}>{error}</p>}

                <div style={gridContainerStyle}>
                    <div style={dashboardCardStyle}>
                        <div style={cardIconContainerStyle}>
                            <i className="fas fa-box" style={cardIconStyle}></i>
                        </div>
                        <h3 style={cardTitleStyle}>Total Products</h3>
                        <p style={cardValueStyle}>{stats.totalProducts}</p>
                        <button onClick={() => navigate('/admin/products')} style={cardActionButtonStyle}>Manage Products</button>
                    </div>

                    <div style={dashboardCardStyle}>
                        <div style={cardIconContainerStyle}>
                            <i className="fas fa-users" style={cardIconStyle}></i>
                        </div>
                        <h3 style={cardTitleStyle}>Total Customers</h3>
                        <p style={cardValueStyle}>{stats.totalCustomers}</p>
                        <button onClick={() => navigate('/admin/customers')} style={cardActionButtonStyle}>Manage Customers</button>
                    </div>

                    <div style={dashboardCardStyle}>
                        <div style={cardIconContainerStyle}>
                            <i className="fas fa-shopping-cart" style={cardIconStyle}></i>
                        </div>
                        <h3 style={cardTitleStyle}>Total Orders</h3> {/* Changed title to Total Orders */}
                        <p style={cardValueStyle}>{stats.totalOrders}</p> {/* Display total orders */}
                        <button onClick={() => navigate('/admin/orders')} style={cardActionButtonStyle}>Manage Orders</button>
                    </div>

                    {/* New card for Total Revenue */}
                    <div style={dashboardCardStyle}>
                        <div style={cardIconContainerStyle}>
                            <i className="fas fa-dollar-sign" style={cardIconStyle}></i>
                        </div>
                        <h3 style={cardTitleStyle}>Total Revenue</h3>
                        <p style={cardValueStyle}>${stats.totalRevenue}</p>
                        <button onClick={() => navigate('/admin/orders')} style={cardActionButtonStyle}>View Sales</button>
                    </div>

                     {/* New card for Pending Orders */}
                     <div style={dashboardCardStyle}>
                        <div style={cardIconContainerStyle}>
                            <i className="fas fa-clock" style={cardIconStyle}></i>
                        </div>
                        <h3 style={cardTitleStyle}>Pending Orders</h3>
                        <p style={cardValueStyle}>{stats.pendingOrders}</p>
                        <button onClick={() => navigate('/admin/orders?status=Pending')} style={cardActionButtonStyle}>Review Pending</button>
                    </div>

                    {/* This card will now display the derived ordersByStatus or be removed if not needed */}
                    <div style={dashboardCardStyle}>
                        <div style={cardIconContainerStyle}>
                            <i className="fas fa-info-circle" style={cardIconStyle}></i>
                        </div>
                        <h3 style={cardTitleStyle}>Order Status Summary</h3>
                        <div style={ordersStatusListStyle}>
                            {Object.entries(stats.ordersByStatus).length > 0 ? (
                                Object.entries(stats.ordersByStatus).map(([status, count]) => (
                                    <p key={status} style={orderStatusItemStyle}>
                                        <span style={{ ...orderStatusBadgeStyle, backgroundColor: getStatusColor(status) }}>
                                            {status}:
                                        </span>
                                        <span style={orderStatusCountStyle}>{count}</span>
                                    </p>
                                ))
                            ) : (
                                <p style={{ color: '#777', fontSize: '0.95em' }}>No detailed status breakdown available.</p>
                            )}
                        </div>
                        <button onClick={() => navigate('/admin/orders')} style={cardActionButtonStyle}>View All Orders</button>
                    </div>

                </div>

                <div style={logoutButtonContainerStyle}>
                    <button onClick={handleLogout} style={logoutButtonStyle}>
                        <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Inline Styles for Luxury and Premium UI ---

const pageContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5', // Light background for the whole page
    fontFamily: 'Inter, Arial, sans-serif', // Consistent font
};

const contentAreaStyle = {
    flex: 1,
    padding: '40px',
    backgroundColor: '#ffffff', // White background for the main content area
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', // Deeper shadow
    margin: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center content horizontally
    animation: 'fadeIn 0.5s ease-out', // Fade in animation for the content area
};

const headerContainerStyle = {
    display: 'flex',
    flexDirection: 'column', // Align items vertically
    alignItems: 'center',
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e0f2f7',
};

const brandContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
};

const brandLogoStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    marginRight: '15px',
    border: '3px solid #3498db',
    boxShadow: '0 0 15px rgba(52, 152, 219, 0.4)',
};

const brandNameStyle = {
    fontSize: '2.8em',
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: '1px',
    textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
};

const pageTitleStyle = {
    color: '#34495e',
    fontSize: '2em',
    fontWeight: '600',
    margin: 0,
    marginTop: '10px',
};

const errorMessageStyle = {
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: '1.1em',
    fontWeight: 'bold',
    padding: '12px',
    backgroundColor: '#fde7e7',
    borderRadius: '8px',
    border: '1px solid #e74c3c',
    width: '100%',
    maxWidth: '800px',
    marginBottom: '30px',
    animation: 'shake 0.5s ease-in-out',
};

const fullPageLoadingContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Inter, Arial, sans-serif',
};

const spinnerStyle = {
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #3498db',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
};

const accessDeniedContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Inter, Arial, sans-serif',
    textAlign: 'center',
    padding: '30px',
};

const accessDeniedTitleStyle = {
    fontSize: '3em',
    color: '#dc3545',
    marginBottom: '20px',
    fontWeight: '700',
};

const accessDeniedMessageStyle = {
    fontSize: '1.2em',
    color: '#555',
    marginBottom: '30px',
    maxWidth: '500px',
};

const goHomeButtonStyle = {
    padding: '15px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.2em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 6px 15px rgba(0, 123, 255, 0.3)',
    ':hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-2px)',
    },
};

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsive grid
    gap: '30px',
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '50px',
};

const dashboardCardStyle = {
    backgroundColor: '#f9f9f9',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    cursor: 'pointer',
    ':hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
    },
    animation: 'fadeInUp 0.6s ease-out forwards', // Apply animation
    opacity: 0, // Start invisible for animation
    transform: 'translateY(20px)', // Start lower for animation
};

const cardIconContainerStyle = {
    backgroundColor: '#e0f2f7',
    borderRadius: '50%',
    padding: '20px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(52, 152, 219, 0.2)',
};

const cardIconStyle = {
    fontSize: '2.5em',
    color: '#3498db',
};

const cardTitleStyle = {
    color: '#2c3e50',
    fontSize: '1.8em',
    marginBottom: '10px',
    fontWeight: '700',
};

const cardValueStyle = {
    fontSize: '3em',
    fontWeight: '800',
    color: '#007bff',
    marginBottom: '20px',
};

const ordersStatusListStyle = {
    width: '100%',
    textAlign: 'left',
    marginBottom: '20px',
    maxHeight: '150px', // Limit height for scroll if many statuses
    overflowY: 'auto',
    paddingRight: '10px',
};

const orderStatusItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px dashed #eee',
    fontSize: '1em',
    color: '#555',
};

const orderStatusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.9em',
};

const orderStatusCountStyle = {
    fontWeight: 'bold',
    color: '#333',
};

const cardActionButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    marginTop: 'auto', // Pushes button to the bottom of the card
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)',
    width: 'calc(100% - 60px)', // Adjust width for padding
    ':hover': {
        backgroundColor: '#27ae60',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 15px rgba(46, 204, 113, 0.4)',
    },
};

const logoutButtonContainerStyle = {
    width: '100%',
    maxWidth: '1200px',
    textAlign: 'right',
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '2px solid #e0f2f7',
};

const logoutButtonStyle = {
    padding: '15px 30px',
    backgroundColor: '#dc3545', // Red for logout
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.2em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 15px rgba(220, 53, 69, 0.3)',
    ':hover': {
        backgroundColor: '#c82333',
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 20px rgba(220, 53, 69, 0.4)',
    },
    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 4px 10px rgba(220, 53, 69, 0.3)',
    },
};

// Keyframes for animations (ensure these are in your client/src/index.css or a global stylesheet)
/*
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
*/
export default AdminDashboard;
