// client/src/pages/customer/CartPage.js
import React, { useState, useEffect } from 'react';
import CustomerNav from '../../components/customer/CustomerNav';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Load cart from localStorage on component mount
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(storedCart);
    }, []);

    const updateQuantity = (id, newQuantity) => {
        const updatedCart = cartItems.map(item =>
            item._id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const removeItem = (id) => {
        const updatedCart = cartItems.filter(item => item._id !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        navigate('/checkout');
    };

    return (
        <div style={pageContainerStyle}>
            <CustomerNav />
            <div style={contentAreaStyle}>
                <h2 style={pageTitleStyle}>Your Shopping Cart</h2>

                {cartItems.length === 0 ? (
                    <div style={emptyCartStyle}>
                        <p>Your cart is empty.</p>
                        <button onClick={() => navigate('/products')} style={shopNowButtonStyle}>Start Shopping!</button>
                    </div>
                ) : (
                    <>
                        <div style={cartTableContainerStyle}>
                            <table style={cartTableStyle}>
                                <thead>
                                    <tr style={tableHeaderRowStyle}>
                                        <th style={tableHeaderCellStyle}>Product</th>
                                        <th style={tableHeaderCellStyle}>Price</th>
                                        <th style={tableHeaderCellStyle}>Quantity</th>
                                        <th style={tableHeaderCellStyle}>Subtotal</th>
                                        <th style={tableHeaderCellStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map(item => (
                                        <tr key={item._id} style={tableRowStyle}>
                                            <td style={tableBodyCellStyle}>
                                                <div style={productInfoStyle}>
                                                    <img src={item.imageUrl || 'https://placehold.co/60x60/eeeeee/333333?text=Prod'} alt={item.name} style={productImageStyle} />
                                                    <span style={productNameStyle}>{item.name}</span>
                                                </div>
                                            </td>
                                            <td style={tableBodyCellStyle}>${item.price.toFixed(2)}</td>
                                            <td style={tableBodyCellStyle}>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                                                    min="1"
                                                    style={quantityInputStyle}
                                                />
                                            </td>
                                            <td style={tableBodyCellStyle}>${(item.price * item.quantity).toFixed(2)}</td>
                                            <td style={tableBodyCellStyle}>
                                                <button onClick={() => removeItem(item._id)} style={removeButtonStyle}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={cartSummaryStyle}>
                            <div style={totalAmountStyle}>
                                <span>Total:</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                            <button onClick={handleCheckout} style={checkoutButtonStyle}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Inline Styles for Beautiful UI ---
const pageContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5', // Light background for the whole page
    fontFamily: 'Arial, sans-serif', // Consistent font
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

const shopNowButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#3498db', // A vibrant blue
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

const cartTableContainerStyle = {
    width: '100%',
    overflowX: 'auto',
    marginBottom: '40px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    borderRadius: '10px',
    backgroundColor: '#fff',
};

const cartTableStyle = {
    width: '100%',
    borderCollapse: 'separate', // Use separate for rounded corners on cells
    borderSpacing: '0',
    borderRadius: '10px',
    overflow: 'hidden', // Ensures rounded corners apply
};

const tableHeaderRowStyle = {
    backgroundColor: '#ecf0f1', // Light grey header
    color: '#34495e', // Darker text for header
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
    borderBottom: '1px solid #f0f0f0', // Lighter border for rows
    transition: 'background-color 0.2s ease',
    ':hover': {
        backgroundColor: '#f8f8f8', // Subtle hover effect
    },
};

const tableBodyCellStyle = {
    padding: '15px 20px',
    verticalAlign: 'middle',
    color: '#333',
};

const productInfoStyle = {
    display: 'flex',
    alignItems: 'center',
};

const productImageStyle = {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '8px', // Slightly more rounded
    marginRight: '15px',
    border: '1px solid #eee',
};

const productNameStyle = {
    fontWeight: '600',
    fontSize: '1.1em',
};

const quantityInputStyle = {
    width: '70px',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1em',
    textAlign: 'center',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
};

const removeButtonStyle = {
    padding: '10px 18px',
    backgroundColor: '#e74c3c', // Red for remove
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 2px 8px rgba(231, 76, 60, 0.2)',
};

const cartSummaryStyle = {
    width: '100%',
    maxWidth: '500px', // Constrain width for summary
    backgroundColor: '#f9f9f9',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid #eee',
    marginTop: '20px',
};

const totalAmountStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.8em',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '1px dashed #ddd',
};

const checkoutButtonStyle = {
    width: '100%',
    padding: '18px 30px',
    backgroundColor: '#2ecc71', // Green for checkout
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.4em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 6px 15px rgba(46, 204, 113, 0.3)',
};

export default CartPage;
