// client/src/pages/customer/CustomerDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import CustomerNav from '../../components/customer/CustomerNav'; // Ensure this path is correct



const BACKEND_URL = 'http://localhost:5000'; 
const CustomerDashboard = () => {
    const { user, logout, authAxios } = useAuth();
    const navigate = useNavigate();
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState('');

    const [selectedOrder, setSelectedOrder] = useState(null);
const viewOrderDetails = (order) => setSelectedOrder(order);
const closeOrderDetails = () => setSelectedOrder(null);

const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#ffc107';
            case 'Processing': return '#007bff';
            case 'Shipped': return '#17a2b8';
            case 'Delivered': return '#28a745';
            case 'Cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };
    // Mock data for featured products (now with actual image URLs from Unsplash Source)
    const featuredProducts = [
        {
            id: 'prod1',
            name: 'Luxury Smartwatch',
            imageUrl: 'http://localhost:5000/uploads/14.jpeg', // Realistic smartwatch image
            price: 299.99,
            description: 'Unlock your potential. Limited Stock!',
            tag: 'New Arrival'
        },
        {
            id: 'prod2',
            name: 'Premium Wireless Earbuds',
            imageUrl: 'http://localhost:5000/uploads/45.jpeg', // Realistic earbuds image
            price: 149.99,
            description: 'Experience pure sound. Don\'t miss out!',
            tag: 'Best Seller'
        },
        {
            id: 'prod3',
            name: 'Ergonomic Office Chair',
            imageUrl: 'http://localhost:5000/uploads/51.jpeg', // Realistic office chair image
            price: 450.00,
            description: 'Work in comfort. Exclusive Discount!',
            tag: 'Top Rated'
        },
        {
            id: 'prod4',
            name: 'High-Performance Laptop',
             imageUrl: 'http://localhost:5000/uploads/1.jpg', // Realistic laptop image
            price: 1299.00,
            description: 'Power your ideas. Flash Sale!',
            tag: 'Hot Deal'
        },
    ];

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

    // Handler for product card click
    const handleProductClick = (productId) => {
        console.log(`Navigating to product details for ID: ${productId}`);
        navigate(`/products/${productId}`);
    };

    if (!user) {
        // This state should ideally be handled by PrivateRoute's loading state
        // but keeping it here as a fallback for initial user loading.
        return (
            <div style={loadingContainerStyle}>
                <div style={spinnerStyle}></div>
                <p style={{ color: colors.textMedium, marginTop: '20px', fontSize: '1.1em' }}>Loading user data...</p>
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

                {/* Featured Products Section */}
                <h3 style={sectionHeaderStyle}>Featured Products</h3>
                <div style={featuredProductsContainerStyle}>
                    {featuredProducts.map(product => (
                        <div key={product.id} style={productCardStyle} onClick={() => handleProductClick(product.id)}>
                            <div style={productImageWrapperStyle}>
                                <img
                                src={
                                    product.imageUrl?.startsWith('http')
                                    ? product.imageUrl
                                    : `${BACKEND_URL}${product.imageUrl}`
                                }
                                alt={product.name}
                                style={productImageStyle}
                                />
                                {product.tag && <span style={productTagStyle}>{product.tag}</span>}
                            </div>
                            <h4 style={productNameStyle}>{product.name}</h4>
                            <p style={productDescriptionStyle}>{product.description}</p>
                            <span style={productPriceStyle}>${product.price.toFixed(2)}</span>
                            <button style={productCtaButtonStyle}>Grab Yours Now!</button> {/* More tempting CTA */}
                        </div>
                    ))}
                </div>


                <h3 style={sectionHeaderStyle}>Recent Orders</h3>
                {loadingOrders ? (
                    <div style={loadingOrdersContainerStyle}>
                        <div style={spinnerStyle}></div>
                        <p style={{ color: colors.textMedium, marginTop: '15px' }}>Loading recent orders...</p>
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
                                           <button onClick={() => viewOrderDetails(order)} style={viewDetailsButtonStyle}>View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {selectedOrder && (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h3 style={modalTitleStyle}>Order Details - {selectedOrder._id.substring(0, 8)}...</h3>
                    
                    <div style={modalInfoGridStyle}>
    <p><strong>Status:</strong> <span style={{ color: getStatusColor(selectedOrder.status), fontWeight: 'bold' }}>{selectedOrder.status}</span></p>
    <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
    <p><strong>Total Amount:</strong> <span style={{ fontWeight: 'bold', color: '#007bff' }}>${selectedOrder.totalAmount.toFixed(2)}</span></p>
</div>

<h4 style={modalSectionHeaderStyle}>Products:</h4>
<div style={modalProductsListStyle}>
    {selectedOrder.products?.map(item => (
        <div key={item.product?._id || item._id} style={modalProductItemStyle}>
            <img
                src={item.product?.imageUrl || 'https://placehold.co/50x50/eeeeee/333333?text=Prod'}
                alt={item.product?.name || 'Product Image'}
                style={modalProductImageStyle}
            />
            <span style={modalProductNameStyle}>
                {item.product?.name || 'Unknown Product'} x {item.quantity}
            </span>
            <span style={modalProductPriceStyle}>
                ${(item.priceAtOrder || item.product?.price || 0).toFixed(2)}
            </span>
        </div>
    ))}
</div>

<h4 style={modalSectionHeaderStyle}>Shipping Address:</h4>
<div style={modalAddressStyle}>
    <p>{selectedOrder.shippingAddress?.address1}</p>
    {selectedOrder.shippingAddress?.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}</p>
    <p>{selectedOrder.shippingAddress?.country}</p>
    {selectedOrder.shippingAddress?.phone && <p>Phone: {selectedOrder.shippingAddress.phone}</p>}
</div>


                    <div style={modalFooterStyle}>
                        <button onClick={closeOrderDetails} style={closeModalButtonStyle}>Close</button>
                    </div>
                </div>
            </div>
        )}
                    </div>
                )}
                <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
            </div>
        </div>
    );
};



// --- Define the sophisticated color palette ---
const colors = {
    primaryDarkPurple: '#4A148C', // Deep Indigo/Purple
    secondaryGold: '#FFD700', // Goldenrod
    backgroundLight: '#FDFDFD', // Near White
    textDark: '#2C3E50', // Dark Slate Blue
    textMedium: '#7F8C8D', // Medium Grey
    borderLight: '#E0E0E0', // Light Grey
    successGreen: '#28a745', // Green
    errorRed: '#dc3545', // Red
    infoTeal: '#17A2B8', // Teal
    accentBlue: '#007bff', // Bright Blue
    buttonHoverDark: '#3A0F6B', // Darker Purple
    cardBackground: '#FFFFFF', // Pure white for cards
    shadowLight: 'rgba(0, 0, 0, 0.1)', // Adjusted shadow for original style
    shadowMedium: 'rgba(0, 0, 0, 0.15)',
    shadowDeep: 'rgba(0, 0, 0, 0.25)',
};

// --- Inline Styles for Beautiful UI and Animations (using original font sizes/layout with new colors) ---
const pageContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: colors.backgroundLight, // Using new background color
    fontFamily: 'Inter, Arial, sans-serif',
};

const contentAreaStyle = {
    flex: 1,
    padding: '40px',
    backgroundColor: colors.cardBackground, // Using new card background color
    borderRadius: '12px',
    boxShadow: `0 8px 25px ${colors.shadowLight}`, // Using new shadow color
    margin: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeIn 0.5s ease-out',
};

const pageTitleStyle = {
    color: colors.textDark, // Using new dark text color
    fontSize: '2.5em',
    marginBottom: '15px',
    fontWeight: '700',
    textAlign: 'center',
};

const welcomeMessageStyle = {
    fontSize: '1.1em',
    color: colors.textMedium, // Using new medium text color
    marginBottom: '40px',
    textAlign: 'center',
};

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    width: '100%',
    maxWidth: '1000px',
    marginBottom: '50px',
};

const dashboardCardStyle = {
    backgroundColor: colors.cardBackground, // Using new card background color
    padding: '30px',
    borderRadius: '15px',
    boxShadow: `0 6px 20px ${colors.shadowLight}`, // Using new shadow color
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    cursor: 'pointer',
    ':hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 12px 30px ${colors.shadowMedium}`, // Using new shadow color
    },
};

const cardTitleStyle = {
    color: colors.accentBlue, // Using new accent blue color
    fontSize: '1.6em',
    marginBottom: '15px',
    fontWeight: '600',
};

const cardDescriptionStyle = {
    fontSize: '0.95em',
    color: colors.textMedium, // Using new medium text color
    marginBottom: '20px',
};

const cardButtonStyle = {
    padding: '12px 25px',
    backgroundColor: colors.accentBlue, // Using new accent blue color
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    marginTop: '15px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: `0 4px 10px rgba(0, 123, 255, 0.3)`, // Using new accent blue shadow
    ':hover': {
        backgroundColor: colors.buttonHoverDark, // Using new hover dark color (can be adjusted)
        transform: 'translateY(-2px)',
    },
};

const sectionHeaderStyle = {
    color: colors.textDark, // Using new dark text color
    fontSize: '2em',
    marginBottom: '30px',
    fontWeight: '700',
    borderBottom: `2px solid ${colors.secondaryGold}`, // Using new gold accent color
    paddingBottom: '10px',
    width: '100%',
    maxWidth: '1000px',
    textAlign: 'left',
};

const loadingContainerStyle = {
    textAlign: 'center',
    padding: '50px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
};

const loadingOrdersContainerStyle = {
    textAlign: 'center',
    padding: '50px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
};

const spinnerStyle = {
    border: `8px solid ${colors.borderLight}`, // Using new border light color
    borderTop: `8px solid ${colors.accentBlue}`, // Using new accent blue color
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
};

const errorMessageStyle = {
    color: colors.errorRed, // Using new error red color
    textAlign: 'center',
    fontSize: '1.1em',
    fontWeight: 'bold',
    padding: '20px',
    backgroundColor: `rgba(220, 53, 69, 0.1)`, // Using new error red with alpha
    borderRadius: '8px',
    border: `1px solid ${colors.errorRed}`, // Using new error red color
    width: '100%',
    maxWidth: '800px',
};

const noOrdersMessageStyle = {
    textAlign: 'center',
    fontSize: '1.2em',
    color: colors.textMedium, // Using new medium text color
    padding: '30px',
    border: `2px dashed ${colors.borderLight}`, // Using new border light color
    borderRadius: '10px',
    backgroundColor: colors.cardBackground, // Using new card background color
    width: '100%',
    maxWidth: '800px',
};

const linkStyle = {
    color: colors.accentBlue, // Using new accent blue color
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
    boxShadow: `0 4px 15px ${colors.shadowLight}`, // Using new shadow color
    borderRadius: '10px',
    backgroundColor: colors.cardBackground, // Using new card background color
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
    backgroundColor: colors.borderLight, // Using new border light color for header background
    color: colors.textDark, // Using new dark text color
    fontSize: '1em',
    fontWeight: '600',
    textTransform: 'uppercase',
};

const tableHeaderCellStyle = {
    padding: '18px 20px',
    textAlign: 'left',
    borderBottom: `1px solid ${colors.borderLight}`, // Using new border light color
};

const tableRowStyle = {
    borderBottom: `1px solid ${colors.borderLight}`, // Using new border light color
    transition: 'background-color 0.2s ease',
    ':hover': {
        backgroundColor: '#f8f8f8', // Still a light hover, can be adjusted with colors.backgroundLight
    },
};

const tableBodyCellStyle = {
    padding: '15px 20px',
    verticalAlign: 'middle',
    color: colors.textDark, // Using new dark text color
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
    backgroundColor: colors.accentBlue, // Using new accent blue color
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    ':hover': {
        backgroundColor: colors.buttonHoverDark, // Using new hover dark color
        transform: 'translateY(-1px)',
    },
};

const logoutButtonStyle = {
    padding: '15px 30px',
    backgroundColor: colors.errorRed, // Using new error red color
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.2em',
    fontWeight: 'bold',
    marginTop: '50px',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: `0 6px 15px rgba(220, 53, 69, 0.3)`, // Using new error red shadow
    ':hover': {
        backgroundColor: '#c82333', // A slightly darker red for hover
        transform: 'translateY(-3px)',
        boxShadow: `0 8px 20px rgba(220, 53, 69, 0.4)`,
    },
    ':active': {
        transform: 'translateY(0)',
        boxShadow: `0 4px 10px rgba(220, 53, 69, 0.3)`,
    },
};

// --- Styles for Featured Products (with innovative elements) ---
const featuredProductsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Responsive grid for products
    gap: '30px',
    width: '100%',
    maxWidth: '1000px',
    marginBottom: '50px',
};

const productCardStyle = {
    backgroundColor: colors.cardBackground,
    padding: '20px',
    borderRadius: '12px',
    boxShadow: `0 5px 20px ${colors.shadowLight}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    cursor: 'pointer',
    position: 'relative', // For the tag positioning
    overflow: 'hidden', // Ensure tag doesn't overflow
    ':hover': {
        transform: 'translateY(-10px) rotateX(5deg)', // Subtle 3D tilt on hover
        boxShadow: `0 15px 40px ${colors.shadowMedium}`,
        animation: 'pulseGlow 1.5s infinite alternate', // Tempting pulse glow
    },
};

const productImageWrapperStyle = {
    position: 'relative',
    width: '150px',
    height: '150px',
    marginBottom: '15px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: `2px solid ${colors.secondaryGold}`,
    boxShadow: `0 4px 10px ${colors.shadowLight}`,
};

const productImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.5s ease',
    ':hover': {
        transform: 'scale(1.1)', // Zoom effect on image hover
    },
};

const productTagStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: colors.primaryDarkPurple, // Dark purple tag
    color: colors.secondaryGold, // Gold text
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '0.8em',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: `0 2px 5px ${colors.shadowLight}`,
    zIndex: 10,
    transform: 'rotate(5deg)', // Slight tilt for emphasis
};

const productNameStyle = {
    fontSize: '1.4em',
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: '8px',
};

const productDescriptionStyle = {
    fontSize: '0.95em',
    color: colors.textMedium,
    marginBottom: '15px',
    height: '40px', // Fixed height to prevent layout shifts
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

const productPriceStyle = {
    fontSize: '1.6em',
    fontWeight: '700',
    color: colors.primaryDarkPurple,
    marginBottom: '20px',
};

const productCtaButtonStyle = {
    padding: '12px 25px',
    background: `linear-gradient(45deg, ${colors.infoTeal}, #117a8b)`,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    marginTop: '15px',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: `0 4px 10px rgba(23, 162, 184, 0.3)`,
    ':hover': {
        backgroundColor: '#117a8b',
        transform: 'translateY(-2px) scale(1.02)', // Lift and slight scale
        boxShadow: `0 8px 20px rgba(23, 162, 184, 0.4)`,
        animation: 'buttonPulse 0.8s infinite alternate', // Pulsing effect on button
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

@keyframes pulseGlow {
    0% { box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(255, 215, 0, 0.4); }
    50% { box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15), 0 0 15px 5px rgba(255, 215, 0, 0.7); }
    100% { box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(255, 215, 0, 0.4); }
}

@keyframes buttonPulse {
    0% { transform: scale(1); box-shadow: 0 4px 10px rgba(23, 162, 184, 0.3); }
    100% { transform: scale(1.03); box-shadow: 0 8px 20px rgba(23, 162, 184, 0.5); }
}
*/

export default CustomerDashboard;

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '35px',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    width: '90%',
    maxWidth: '750px',
    maxHeight: '90vh',
    overflowY: 'auto',
};

const modalTitleStyle = {
    fontSize: '2em',
    color: '#2c3e50',
    marginBottom: '25px',
    fontWeight: '700',
    borderBottom: '2px solid #e0f2f7',
    paddingBottom: '10px',
};

const modalInfoGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '1px dashed #eee',
};

const modalSectionHeaderStyle = {
    fontSize: '1.4em',
    color: '#34495e',
    marginTop: '25px',
    marginBottom: '15px',
    fontWeight: '600',
};

const modalProductsListStyle = {
    maxHeight: '200px',
    overflowY: 'auto',
    paddingRight: '10px',
    marginBottom: '25px',
    borderBottom: '1px dashed #eee',
    paddingBottom: '15px',
};

const modalProductItemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
};

const modalProductImageStyle = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginRight: '15px',
    border: '1px solid #eee',
};

const modalProductNameStyle = {
    flexGrow: 1,
    fontSize: '1em',
    color: '#333',
};

const modalProductPriceStyle = {
    fontWeight: 'bold',
    color: '#007bff',
    fontSize: '1em',
};

const modalAddressStyle = {
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '25px',
};

const modalFooterStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '30px',
};

const closeModalButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
};
