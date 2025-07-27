// client/src/pages/customer/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import CustomerNav from '../../components/customer/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
    const { authAxios } = useAuth(); // Removed 'user' as it's not directly used here
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [shippingAddress, setShippingAddress] = useState({
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false); // State for success animation

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (storedCart.length === 0) {
            // Use a custom message box instead of alert()
            showMessageBox('Your cart is empty. Please add items before checking out.', () => navigate('/products'));
            return;
        }
        setCartItems(storedCart);

        // Optionally, pre-fill address if user has a default address stored or from profile
        // For now, we'll leave it blank for user input
    }, [navigate]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    };

    const placeOrder = async () => {
        if (cartItems.length === 0) {
            setError('Your cart is empty!');
            return;
        }
        // Basic validation for required fields
        const requiredFields = ['address1', 'city', 'state', 'zip', 'country'];
        const missingFields = requiredFields.filter(field => !shippingAddress[field]);
        if (missingFields.length > 0) {
             setError(`Please fill in all required shipping address fields: ${missingFields.join(', ')}.`);
             return;
        }

        setLoading(true);
        setError('');
        try {
            const orderItems = cartItems.map(item => ({
                productId: item._id,
                quantity: item.quantity
            }));

            const orderData = {
                orderItems,
                shippingAddress,
                totalAmount: calculateTotal()
            };

            const res = await authAxios.post('/orders', orderData);
            localStorage.removeItem('cart'); // Clear cart after successful order
            setCartItems([]); // Clear cart state
            setOrderPlaced(true); // Trigger success animation

            // Use custom message box for success
            showMessageBox(`Order placed successfully! Order ID: ${res.data._id.substring(0, 8)}...`, () => {
                navigate('/my-orders'); // Redirect to order history
            });

        } catch (err) {
            console.error('Order placement failed:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Custom message box function
    const showMessageBox = (message, onConfirm) => {
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
            font-family: Arial, sans-serif;
            max-width: 400px;
            width: 90%;
            animation: fadeIn 0.3s ease-out;
        `;
        messageBox.innerHTML = `
            <p style="font-size: 1.2em; margin-bottom: 20px;">${message}</p>
            <button id="msgBoxConfirmBtn" style="
                padding: 10px 20px;
                background-color: #007bff;
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


    return (
        <div style={pageContainerStyle}>
            <CustomerNav />
            <div style={contentAreaStyle}>
                <h2 style={pageTitleStyle}>Complete Your Order</h2>

                {error && <p style={errorMessageStyle}>{error}</p>}
                {loading && (
                    <div style={loadingOverlayStyle}>
                        <div style={spinnerStyle}></div>
                        <p style={{ color: '#007bff', marginTop: '15px', fontSize: '1.1em' }}>Placing your order...</p>
                    </div>
                )}
                {orderPlaced && (
                    <div style={successOverlayStyle}>
                        <div style={successIconStyle}>✓</div>
                        <p style={{ color: 'white', fontSize: '1.5em', fontWeight: 'bold' }}>Order Placed!</p>
                    </div>
                )}

                {!orderPlaced && cartItems.length > 0 ? (
                    <div style={gridContainerStyle}>
                        {/* Shipping Address Section */}
                        <div style={sectionCardStyle}>
                            <h3 style={sectionTitleStyle}>Shipping Address</h3>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Address Line 1:</label>
                                <input type="text" name="address1" value={shippingAddress.address1} onChange={handleAddressChange} required style={inputStyle} placeholder="Street address, P.O. box, company name, c/o" />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Address Line 2 (Optional):</label>
                                <input type="text" name="address2" value={shippingAddress.address2} onChange={handleAddressChange} style={inputStyle} placeholder="Apartment, suite, unit, building, floor, etc." />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>City:</label>
                                <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>State/Province/Region:</label>
                                <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>ZIP / Postal Code:</label>
                                <input type="text" name="zip" value={shippingAddress.zip} onChange={handleAddressChange} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Country:</label>
                                <input type="text" name="country" value={shippingAddress.country} onChange={handleAddressChange} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Phone Number:</label>
                                <input type="text" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} style={inputStyle} placeholder="Optional" />
                            </div>
                        </div>

                        {/* Order Summary Section */}
                        <div style={sectionCardStyle}>
                            <h3 style={sectionTitleStyle}>Order Summary</h3>
                            <div style={orderSummaryItemsStyle}>
                                {cartItems.map(item => (
                                    <div key={item._id} style={orderItemStyle}>
                                        <img src={item.imageUrl || 'https://placehold.co/50x50/eeeeee/333333?text=Prod'} alt={item.name} style={orderItemImageStyle} />
                                        <span style={orderItemNameStyle}>{item.name} x {item.quantity}</span>
                                        <span style={orderItemPriceStyle}>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={totalAmountStyle}>
                                <span>Order Total:</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                            <button onClick={placeOrder} disabled={loading || cartItems.length === 0} style={placeOrderButtonStyle}>
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                ) : (
                    !orderPlaced && <div style={emptyCartStyle}>
                        <p>Your cart is empty. <a href="/products" style={{ color: '#007bff' }}>Start shopping!</a></p>
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
    fontFamily: 'Inter, Arial, sans-serif', // Using Inter font
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
};

const pageTitleStyle = {
    color: '#2c3e50', // Darker title color
    fontSize: '2.5em',
    marginBottom: '40px',
    fontWeight: '700',
    textAlign: 'center',
};

const errorMessageStyle = {
    color: '#e74c3c', // Red for errors
    marginBottom: '20px',
    fontSize: '1em',
    fontWeight: 'bold',
    textAlign: 'center',
};

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', // Responsive grid
    gap: '30px',
    width: '100%',
    maxWidth: '1200px', // Max width for content
};

const sectionCardStyle = {
    backgroundColor: '#f9f9f9',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
    transition: 'transform 0.3s ease-in-out',
    ':hover': {
        transform: 'translateY(-5px)',
    },
};

const sectionTitleStyle = {
    color: '#34495e',
    fontSize: '1.8em',
    marginBottom: '25px',
    fontWeight: '600',
    borderBottom: '2px solid #e0f2f7',
    paddingBottom: '10px',
};

const formGroupStyle = {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555',
    fontSize: '0.95em',
};

const inputStyle = {
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

const orderSummaryItemsStyle = {
    maxHeight: '300px',
    overflowY: 'auto',
    marginBottom: '20px',
    paddingRight: '10px', // For scrollbar
};

const orderItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px dashed #e0f2f7',
};

const orderItemImageStyle = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginRight: '15px',
    border: '1px solid #eee',
};

const orderItemNameStyle = {
    flexGrow: 1,
    fontSize: '1.05em',
    color: '#333',
    fontWeight: '500',
};

const orderItemPriceStyle = {
    fontWeight: 'bold',
    color: '#007bff',
    fontSize: '1.05em',
};

const totalAmountStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.8em',
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '2px solid #e0f2f7',
};

const placeOrderButtonStyle = {
    width: '100%',
    padding: '18px 30px',
    backgroundColor: '#2ecc71', // Green for checkout
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.4em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 15px rgba(46, 204, 113, 0.3)',
    marginTop: '30px',
    ':hover': {
        backgroundColor: '#27ae60',
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 20px rgba(46, 204, 113, 0.4)',
    },
    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)',
    },
    ':disabled': {
        backgroundColor: '#a0d9b4',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
};

const loadingOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1500,
    animation: 'fadeIn 0.3s ease-out',
};

const spinnerStyle = {
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #3498db',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
};

const successOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(46, 204, 113, 0.9)', // Green overlay
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1500,
    animation: 'fadeIn 0.5s ease-out',
};

const successIconStyle = {
    fontSize: '5em',
    color: 'white',
    border: '4px solid white',
    borderRadius: '50%',
    padding: '20px',
    width: '120px',
    height: '120px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    animation: 'bounceIn 0.8s ease-out',
};

const emptyCartStyle = {
    textAlign: 'center',
    fontSize: '1.3em',
    color: '#666',
    padding: '50px',
    border: '2px dashed #ccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    width: '80%',
    maxWidth: '500px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

// Keyframes for animations (ensure these are added to a global CSS file or injected)
// For simplicity, they are conceptually here but would typically be in index.css or a styled-components global style
/*
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.1); opacity: 1; }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
}
*/

export default CheckoutPage;
