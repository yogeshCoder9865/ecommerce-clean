// client/src/pages/customer/CustomerOrdersPage.js
import React, { useEffect, useState } from 'react';
import CustomerNav from '../../components/customer/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerOrdersPage = () => {
    const { authAxios, user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null); // For modal/details view

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) { // Don't fetch if user is not loaded yet
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const res = await authAxios.get('/orders/myorders'); // This endpoint fetches orders for the logged-in user
                setOrders(res.data);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
                setError('Failed to load your orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [authAxios, user]); // Re-run if authAxios or user changes

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
    };

    // Helper for Status Colors (re-used from CustomerDashboard)
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

    if (!user) {
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
                <h2 style={pageTitleStyle}>My Orders</h2>
                <p style={pageDescriptionStyle}>Track the status of your recent and past orders.</p>

                {error && <p style={errorMessageStyle}>{error}</p>}

                {loading ? (
                    <div style={loadingOrdersContainerStyle}>
                        <div style={spinnerStyle}></div>
                        <p style={{ color: '#555', marginTop: '15px' }}>Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div style={noOrdersMessageStyle}>
                        <p>You haven't placed any orders yet.</p>
                        <button onClick={() => navigate('/products')} style={shopNowButtonStyle}>Start Shopping!</button>
                    </div>
                ) : (
                    <div style={tableContainerStyle}>
                        <table style={ordersTableStyle}>
                            <thead>
                                <tr style={tableHeaderRowStyle}>
                                    <th style={tableHeaderCellStyle}>Order ID</th>
                                    <th style={tableHeaderCellStyle}>Date</th>
                                    <th style={tableHeaderCellStyle}>Total</th>
                                    <th style={tableHeaderCellStyle}>Status</th>
                                    <th style={tableHeaderCellStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
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
                                            <button onClick={() => viewOrderDetails(order)} style={viewDetailsButtonStyle}>View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Order Details Modal */}
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
                                {selectedOrder.products.map(item => (
                                    <div key={item.product._id} style={modalProductItemStyle}>
                                        <img src={item.product.imageUrl || 'https://placehold.co/50x50/eeeeee/333333?text=Prod'} alt={item.product.name} style={modalProductImageStyle} />
                                        <span style={modalProductNameStyle}>{item.product.name} x {item.quantity}</span>
                                        <span style={modalProductPriceStyle}>${item.priceAtOrder.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <h4 style={modalSectionHeaderStyle}>Shipping Address:</h4>
                            <div style={modalAddressStyle}>
                                <p>{selectedOrder.shippingAddress.address1}</p>
                                {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                                <p>{selectedOrder.shippingAddress.country}</p>
                                {selectedOrder.shippingAddress.phone && <p>Phone: {selectedOrder.shippingAddress.phone}</p>}
                            </div>

                            <div style={modalFooterStyle}>
                                <button onClick={closeOrderDetails} style={closeModalButtonStyle}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
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
    marginBottom: '10px',
    fontWeight: '700',
    textAlign: 'center',
};

const pageDescriptionStyle = {
    fontSize: '1.1em',
    color: '#555',
    marginBottom: '40px',
    textAlign: 'center',
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
    marginBottom: '30px',
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
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #3498db',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
};

const noOrdersMessageStyle = {
    textAlign: 'center',
    fontSize: '1.3em',
    color: '#666',
    padding: '50px',
    border: '2px dashed #ccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    width: '80%',
    maxWidth: '600px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    marginTop: '20px',
};

const shopNowButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    marginTop: '20px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)',
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

// --- Modal Styles ---
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
    animation: 'fadeIn 0.3s ease-out',
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
    animation: 'zoomIn 0.3s ease-out', // Zoom in animation for modal
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
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(108, 117, 125, 0.3)',
    ':hover': {
        backgroundColor: '#5a6268',
        transform: 'translateY(-2px)',
    },
};

// Keyframes for animations (add these to your client/src/index.css or a global stylesheet)
/*
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes zoomIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
*/
export default CustomerOrdersPage;