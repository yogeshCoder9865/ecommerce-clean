// client/src/pages/admin/AdminOrderManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import { useAuth } from '../../context/AuthContext';

const AdminOrderManagement = () => {
    const { authAxios } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Added for success messages
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchCustomerEmail, setSearchCustomerEmail] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10; // Number of orders per page

    // --- Custom Message Box Functions (Re-used for consistency) ---
    const showMessageBox = (message, type = 'info', onConfirm) => {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 2000;
            text-align: center;
            font-family: 'Inter', Arial, sans-serif;
            max-width: 400px;
            width: 90%;
            animation: fadeIn 0.3s ease-out;
            border: 2px solid ${type === 'error' ? '#e74c3c' : (type === 'success' ? '#28a745' : '#007bff')};
        `;
        messageBox.innerHTML = `
            <p style="font-size: 1.2em; margin-bottom: 20px; color: ${type === 'error' ? '#e74c3c' : (type === 'success' ? '#28a745' : '#333')};">${message}</p>
            <button id="msgBoxConfirmBtn" style="
                padding: 10px 20px;
                background-color: ${type === 'error' ? '#e74c3c' : (type === 'success' ? '#28a745' : '#007bff')};
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1em;
                transition: background-color 0.3s ease;
            ">OK</button>
        `;
        document.body.appendChild(messageBox);

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translate(-50%, -50%); }
                to { opacity: 0; transform: translate(-50%, -60%); }
            }
        `;
        document.head.appendChild(styleSheet);

        document.getElementById('msgBoxConfirmBtn').onclick = () => {
            messageBox.style.animation = 'fadeOut 0.3s ease-in forwards';
            messageBox.addEventListener('animationend', () => {
                document.body.removeChild(messageBox);
                document.head.removeChild(styleSheet);
                if (onConfirm) onConfirm();
            });
        };
    };

    const showConfirmBox = (message, onConfirm, onCancel) => {
        const confirmBox = document.createElement('div');
        confirmBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 2000;
            text-align: center;
            font-family: 'Inter', Arial, sans-serif;
            max-width: 400px;
            width: 90%;
            animation: fadeIn 0.3s ease-out;
            border: 2px solid #ffc107; /* Warning color */
        `;
        confirmBox.innerHTML = `
            <p style="font-size: 1.2em; margin-bottom: 20px; color: #333;">${message}</p>
            <button id="confirmBoxConfirmBtn" style="
                padding: 10px 20px;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1em;
                transition: background-color 0.3s ease;
                margin-right: 10px;
            ">Yes</button>
            <button id="confirmBoxCancelBtn" style="
                padding: 10px 20px;
                background-color: #6c757d;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1em;
                transition: background-color 0.3s ease;
            ">No</button>
        `;
        document.body.appendChild(confirmBox);

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translate(-50%, -50%); }
                to { opacity: 0; transform: translate(-50%, -60%); }
            }
        `;
        document.head.appendChild(styleSheet);

        const removeConfirmBox = () => {
            confirmBox.style.animation = 'fadeOut 0.3s ease-in forwards';
            confirmBox.addEventListener('animationend', () => {
                document.body.removeChild(confirmBox);
                document.head.removeChild(styleSheet);
            });
        };

        document.getElementById('confirmBoxConfirmBtn').onclick = () => {
            removeConfirmBox();
            if (onConfirm) onConfirm();
        };
        document.getElementById('confirmBoxCancelBtn').onclick = () => {
            removeConfirmBox();
            if (onCancel) onCancel();
        };
    };

    // --- Fetch Orders (wrapped in useCallback) ---
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
            };
            if (filterStatus !== 'All') {
                params.status = filterStatus;
            }
            if (searchCustomerEmail) {
                params.customerEmail = searchCustomerEmail;
            }

            const res = await authAxios.get('/orders', { params });
            setOrders(res.data.orders || res.data);
            setTotalPages(res.data.pages || 1);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [authAxios, currentPage, filterStatus, searchCustomerEmail]); // Dependencies for useCallback

    // --- Effect to call fetchOrders on component mount and dependency changes ---
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]); // Depend on the memoized fetchOrders function

    // --- Handlers for Order Actions ---

    const handleFilterStatusChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1);
    };

    const handleSearchCustomerChange = (e) => {
        setSearchCustomerEmail(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewClick = (order) => {
        setSelectedOrder({ ...order });
        setIsViewModalOpen(true);
        setError(''); // Clear errors on modal open
        setSuccessMessage(''); // Clear success on modal open
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        showConfirmBox(`Are you sure you want to change order status to "${newStatus}"?`, async () => {
            try {
                setError('');
                setSuccessMessage('');
                const res = await authAxios.put(`/orders/${orderId}/status`, { status: newStatus });
                setOrders(prev => prev.map(order => order._id === res.data._id ? res.data : order));
                showMessageBox('Order status updated successfully!', 'success');
            } catch (err) {
                console.error('Failed to update order status:', err.response?.data?.message || err.message);
                setError(err.response?.data?.message || 'Failed to update order status.');
            }
        });
    };

    const handleDeleteOrder = async (orderId) => {
        showConfirmBox('Are you sure you want to delete this order? This action cannot be undone and will restore product stock.', async () => {
            try {
                setError('');
                setSuccessMessage('');
                await authAxios.delete(`/orders/${orderId}`);
                setOrders(prev => prev.filter(order => order._id !== orderId));
                showMessageBox('Order deleted successfully!', 'success');
            } catch (err) {
                console.error('Failed to delete order:', err.response?.data?.message || err.message);
                setError(err.response?.data?.message || 'Failed to delete order.');
            }
        });
    };

    // Helper for Status Colors
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

    return (
        <div style={pageContainerStyle}>
            <AdminNav />
            <div style={contentAreaStyle}>
                <div style={headerContainerStyle}>
                    <h2 style={pageTitleStyle}>Order Management</h2>
                </div>

                <div style={controlsContainerStyle}>
                    <div style={filterGroupStyle}>
                        <label htmlFor="filterStatus" style={labelStyle}>Filter by Status:</label>
                        <select id="filterStatus" value={filterStatus} onChange={handleFilterStatusChange} style={selectStyle}>
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div style={filterGroupStyle}>
                        <label htmlFor="searchCustomer" style={labelStyle}>Search by Customer Email:</label>
                        <input
                            type="text"
                            id="searchCustomer"
                            placeholder="Customer email..."
                            value={searchCustomerEmail}
                            onChange={handleSearchCustomerChange}
                            style={searchInputStyle}
                        />
                        <i className="fas fa-search" style={searchIconStyle}></i>
                    </div>
                </div>

                {error && <p style={errorMessageStyle}>{error}</p>}
                {successMessage && <p style={successMessageStyle}>{successMessage}</p>}

                {loading ? (
                    <div style={loadingContainerStyle}>
                        <div style={spinnerStyle}></div>
                        <p style={{ color: '#555', marginTop: '15px' }}>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div style={noOrdersMessageStyle}>
                        <p>No orders found matching your criteria.</p>
                        <button onClick={() => { setFilterStatus('All'); setSearchCustomerEmail(''); setCurrentPage(1); }} style={resetFilterButtonStyle}>Reset Filters</button>
                    </div>
                ) : (
                    <>
                        <div style={tableContainerStyle}>
                            <table style={ordersTableStyle}>
                                <thead>
                                    <tr style={tableHeaderRowStyle}>
                                        <th style={tableHeaderCellStyle}>Order ID</th>
                                        <th style={tableHeaderCellStyle}>Customer</th>
                                        <th style={tableHeaderCellStyle}>Date</th>
                                        <th style={tableHeaderCellStyle}>Total</th>
                                        <th style={tableHeaderCellStyle}>Status</th>
                                        <th style={tableHeaderCellStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={order._id} style={{ ...tableRowStyle, animationDelay: `${index * 0.05}s` }}>
                                            <td style={tableCellStyle}>{order._id.substring(0, 8)}...</td>
                                            <td style={tableCellStyle}>{order.user ? `${order.user.firstName} ${order.user.lastName} (${order.user.email})` : 'N/A'}</td>
                                            <td style={tableCellStyle}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td style={tableCellStyle}>${order.totalAmount.toFixed(2)}</td>
                                            <td style={tableCellStyle}>
                                                <span style={{ ...statusBadgeStyle, backgroundColor: getStatusColor(order.status) }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={tableActionCellStyle}>
                                                <button
                                                    onClick={() => handleViewClick(order)}
                                                    style={{ ...actionButtonStyle, backgroundColor: '#007bff' }}
                                                >
                                                    <i className="fas fa-eye"></i> View
                                                </button>
                                                <select
                                                    onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                                    value={order.status}
                                                    style={{ ...actionButtonStyle, backgroundColor: '#6c757d', marginLeft: '10px', width: 'auto', minWidth: '100px', padding: '8px 12px' }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                    style={{ ...actionButtonStyle, backgroundColor: '#dc3545', marginLeft: '10px' }}
                                                >
                                                    <i className="fas fa-trash-alt"></i> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        <div style={paginationContainerStyle}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    style={{
                                        ...paginationButtonStyle,
                                        backgroundColor: currentPage === page ? '#3498db' : '#ecf0f1',
                                        color: currentPage === page ? 'white' : '#34495e',
                                        fontWeight: currentPage === page ? 'bold' : 'normal',
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* --- View Order Details Modal --- */}
                {isViewModalOpen && selectedOrder && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <h3 style={modalTitleStyle}>Order Details - {selectedOrder._id.substring(0, 8)}...</h3>
                            {error && <p style={modalErrorMessageStyle}>{error}</p>}
                            <div style={modalInfoGridStyle}>
                                <p><strong>Status:</strong> <span style={{ color: getStatusColor(selectedOrder.status), fontWeight: 'bold' }}>{selectedOrder.status}</span></p>
                                <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                <p><strong>Total Amount:</strong> <span style={{ fontWeight: 'bold', color: '#007bff' }}>${selectedOrder.totalAmount.toFixed(2)}</span></p>
                            </div>

                            <h4 style={modalSectionHeaderStyle}>Products:</h4>
                            <div style={modalProductsListStyle}>
                                {selectedOrder.products.map(item => (
                                    <div key={item.product._id} style={modalProductItemStyle}>
                                        <img src={item.product.imageUrl || 'https://placehold.co/60x60/e0f2f7/3498db?text=Prod'} alt={item.product.name} style={modalProductImageStyle} />
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
                                <button onClick={() => setIsViewModalOpen(false)} style={closeModalButtonStyle}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '40px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e0f2f7',
};

const pageTitleStyle = {
    color: '#2c3e50', // Darker title color
    fontSize: '2.5em',
    fontWeight: '700',
    margin: 0,
};

const controlsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center controls
    alignItems: 'center',
    gap: '20px',
    marginBottom: '40px',
    width: '100%',
    maxWidth: '1200px',
    padding: '15px',
    backgroundColor: '#f5f7f9',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

const filterGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    position: 'relative', // For search icon
};

const labelStyle = {
    fontWeight: '600',
    color: '#555',
    fontSize: '1em',
};

const selectStyle = {
    padding: '10px 15px',
    border: '1px solid #cfd8dc',
    borderRadius: '8px',
    fontSize: '1em',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease',
    ':hover': {
        borderColor: '#3498db',
    },
};

const searchInputStyle = {
    padding: '12px 18px 12px 45px', // Left padding for icon
    width: '250px',
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

const searchIconStyle = {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    fontSize: '1.1em',
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

const successMessageStyle = {
    color: '#28a745',
    textAlign: 'center',
    fontSize: '1.1em',
    fontWeight: 'bold',
    padding: '12px',
    backgroundColor: '#d4edda',
    borderRadius: '8px',
    border: '1px solid #28a745',
    width: '100%',
    maxWidth: '800px',
    marginBottom: '30px',
    animation: 'bounceIn 0.6s ease-out',
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

const resetFilterButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    marginTop: '20px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(108, 117, 125, 0.3)',
};

const tableContainerStyle = {
    width: '100%',
    maxWidth: '1200px',
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

const tableCellStyle = {
    padding: '12px 15px',
    borderBottom: '1px solid #eee',
    color: '#333',
};

const statusBadgeStyle = {
    padding: '5px 10px',
    borderRadius: '5px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.9em',
};

const tableActionCellStyle = {
    padding: '12px 15px',
    borderBottom: '1px solid #eee',
    whiteSpace: 'nowrap', // Prevent buttons from wrapping
};

const actionButtonStyle = {
    padding: '8px 15px',
    borderRadius: '5px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    ':hover': {
        backgroundColor: '#218838', // Placeholder, specific colors will override
        transform: 'translateY(-1px)',
    },
};

const paginationContainerStyle = {
    marginTop: '30px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '10px',
};

const paginationButtonStyle = {
    padding: '12px 18px',
    margin: '0 5px',
    border: '1px solid #cfd8dc',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.2s ease',
    ':hover': {
        backgroundColor: '#3498db',
        color: 'white',
        transform: 'translateY(-2px)',
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

const modalErrorMessageStyle = {
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: '1em',
    fontWeight: 'bold',
    padding: '10px',
    backgroundColor: '#fde7e7',
    borderRadius: '8px',
    border: '1px solid #e74c3c',
    marginBottom: '20px',
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

@keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.1); opacity: 1; }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
}

@keyframes zoomIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}
*/



export default AdminOrderManagement;
