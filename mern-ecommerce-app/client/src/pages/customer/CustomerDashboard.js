// client/src/pages/customer/CustomerDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import CustomerNav from '../../components/customer/CustomerNav'; // Ensure this path is correct

const CustomerDashboard = () => {
    const { user, logout, authAxios } = useAuth();
    const navigate = useNavigate();
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState('');

    useEffect(() => {
        const fetchRecentOrders = async () => {
            if (!user) { // Don't fetch if user is not loaded yet
                setLoadingOrders(false); // Stop loading if no user
                return;
            }

            setLoadingOrders(true);
            setOrdersError('');
            try {
                // Assuming you have a /api/orders/myorders endpoint for customers
                const res = await authAxios.get('/orders/myorders');
                setRecentOrders(res.data.slice(0, 5)); // Show last 5 orders
            } catch (err) {
                console.error('Failed to fetch recent orders:', err);
                setOrdersError('Failed to load recent orders. Please try again.');
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchRecentOrders();
    }, [user, authAxios]); // Re-fetch if user or authAxios changes

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        // This state should ideally be handled by PrivateRoute's loading state
        // but keeping it here as a fallback for initial user loading.
        return (
            <div style={loadingContainerStyle}>
                <div style={spinnerStyle}></div>
                <p style={{ color: '#555', marginTop: '20px', fontSize: '1.1em' }}>Loading user data...</p>
            </div>
        );
    }

    return (
        <div style={pageContainerStyle}>
            <CustomerNav />
            <div style={contentAreaStyle}>
                <h2 style={pageTitleStyle}>Welcome, {user.firstName}!</h2>
                <p style={welcomeMessageStyle}>Your personalized hub for all things shopping.</p>

                <div style={gridContainerStyle}>
                    <div style={dashboardCardStyle} onClick={() => navigate('/profile')}>
                        <h3 style={cardTitleStyle}>My Profile</h3>
                        <p style={cardDescriptionStyle}>Manage your personal information and password.</p>
                        <button style={cardButtonStyle}>View Profile</button>
                    </div>
                    <div style={dashboardCardStyle} onClick={() => navigate('/products')}>
                        <h3 style={cardTitleStyle}>Browse Products</h3>
                        <p style={cardDescriptionStyle}>Explore our latest collection of products.</p>
                        <button style={cardButtonStyle}>Shop Now</button>
                    </div>
                    <div style={dashboardCardStyle} onClick={() => navigate('/my-orders')}>
                        <h3 style={cardTitleStyle}>My Orders</h3>
                        <p style={cardDescriptionStyle}>Track your current orders and view past purchases.</p>
                        <button style={cardButtonStyle}>View Orders</button>
                    </div>
                </div>

                <h3 style={sectionHeaderStyle}>Recent Orders</h3>
                {loadingOrders ? (
                    <div style={loadingOrdersContainerStyle}>
                        <div style={spinnerStyle}></div>
                        <p style={{ color: '#555', marginTop: '15px' }}>Loading recent orders...</p>
                    </div>
                ) : ordersError ? (
                    <p style={errorMessageStyle}>{ordersError}</p>
                ) : recentOrders.length === 0 ? (
                    <p style={noOrdersMessageStyle}>You haven't placed any orders yet. <Link to="/products" style={linkStyle}>Start shopping!</Link></p>
                ) : (
                    <div style={tableContainerStyle}>
                        <table style={ordersTableStyle}>
                            <thead>
                                <tr style={tableHeaderRowStyle}>
                                    <th style={tableHeaderCellStyle}>Order ID</th>
                                    <th style={tableHeaderCellStyle}>Date</th>
                                    <th style={tableHeaderCellStyle}>Total</th>
                                    <th style={tableHeaderCellStyle}>Status</th>
                                    <th style={tableHeaderCellStyle}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order._id} style={tableRowStyle}>
                                        <td style={tableBodyCellStyle}>{order._id.substring(0, 8)}...</td>
                                        <td style={tableBodyCellStyle}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style={tableBodyCellStyle}>${order.totalAmount.toFixed(2)}</td>
                                        <td style={tableBodyCellStyle}>
                                            <span style={{ ...orderStatusStyle, backgroundColor: getStatusColor(order.status) }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={tableBodyCellStyle}>
                                            <button onClick={() => navigate(`/my-orders/${order._id}`)} style={viewDetailsButtonStyle}>View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
            </div>
        </div>
    );
};

// --- Helper for Status Colors ---
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

// --- Inline Styles for Beautiful UI and Animations ---
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

const pageTitleStyle = {
    color: '#2c3e50', // Darker title color
    fontSize: '2.5em',
    marginBottom: '15px',
    fontWeight: '700',
    textAlign: 'center',
};

const welcomeMessageStyle = {
    fontSize: '1.1em',
    color: '#555',
    marginBottom: '40px',
    textAlign: 'center',
};

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Responsive grid
    gap: '30px',
    width: '100%',
    maxWidth: '1000px', // Max width for content
    marginBottom: '50px',
};

const dashboardCardStyle = {
    backgroundColor: '#f9f9f9',
    padding: '30px',
    borderRadius: '15px', // More rounded corners
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)', // Softer, larger shadow
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    cursor: 'pointer',
    ':hover': {
        transform: 'translateY(-8px)', // Lift effect on hover
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)', // Enhanced shadow on hover
    },
};

const cardTitleStyle = {
    color: '#007bff',
    fontSize: '1.6em',
    marginBottom: '15px',
    fontWeight: '600',
};

const cardDescriptionStyle = {
    fontSize: '0.95em',
    color: '#666',
    marginBottom: '20px',
};

const cardButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#3498db', // A vibrant blue
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    marginTop: '15px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)',
    ':hover': {
        backgroundColor: '#2980b9',
        transform: 'translateY(-2px)',
    },
};

const sectionHeaderStyle = {
    color: '#2c3e50',
    fontSize: '2em',
    marginBottom: '30px',
    fontWeight: '700',
    borderBottom: '2px solid #e0f2f7',
    paddingBottom: '10px',
    width: '100%',
    maxWidth: '1000px',
    textAlign: 'left',
};

const loadingContainerStyle = { // Added this style definition
    textAlign: 'center',
    padding: '50px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px', // Ensure it takes up space
};

const loadingOrdersContainerStyle = { // Added this style definition
    textAlign: 'center',
    padding: '50px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px', // Ensure it takes up space
};

const spinnerStyle = {
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #3498db',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
};

const errorMessageStyle = {
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: '1.1em',
    fontWeight: 'bold',
    padding: '20px',
    backgroundColor: '#fde7e7',
    borderRadius: '8px',
    border: '1px solid #e74c3c',
    width: '100%',
    maxWidth: '800px',
};

const noOrdersMessageStyle = {
    textAlign: 'center',
    fontSize: '1.2em',
    color: '#666',
    padding: '30px',
    border: '2px dashed #ccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    width: '100%',
    maxWidth: '800px',
};

const linkStyle = {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
    ':hover': {
        textDecoration: 'underline',
    },
};

const tableContainerStyle = {
    width: '100%',
    maxWidth: '1000px',
    overflowX: 'auto',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    borderRadius: '10px',
    backgroundColor: '#fff',
    marginBottom: '40px',
};

const ordersTableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    borderRadius: '10px',
    overflow: 'hidden',
};

const tableHeaderRowStyle = {
    backgroundColor: '#ecf0f1',
    color: '#34495e',
    fontSize: '1em',
    fontWeight: '600',
    textTransform: 'uppercase',
};

const tableHeaderCellStyle = {
    padding: '18px 20px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
};

const tableRowStyle = {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease',
    ':hover': {
        backgroundColor: '#f8f8f8',
    },
};

const tableBodyCellStyle = {
    padding: '15px 20px',
    verticalAlign: 'middle',
    color: '#333',
};

const orderStatusStyle = {
    padding: '5px 10px',
    borderRadius: '5px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.9em',
};

const viewDetailsButtonStyle = {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    ':hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-1px)',
    },
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
    marginTop: '50px',
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

// Keyframes for animations (add these to your client/src/index.css or a global stylesheet)
/*
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
*/

export default CustomerDashboard;
