// client/src/pages/customer/CartPage.js
import React, { useState, useEffect } from 'react';
import CustomerNav from '../../components/customer/CustomerNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Corrected import statement

const CartPage = () => {
    const { authAxios } = useAuth(); // To fetch product details if necessary
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    // New states for product detail modal (copied from ProductBrowsePage)
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentModalImage, setCurrentModalImage] = useState('');

    // New states for cart summary features
    const [couponCode, setCouponCode] = useState('');
    // Removed agreedToTerms as the checkbox is no longer present in the UI
    // const [agreedToTerms, setAgreedToTerms] = useState(false);

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

    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    };

    // Placeholder for discount and taxes - these would typically come from backend logic
    const totalDiscount = 0; // Example: $0.00 saving
    const taxes = 0; // Example: Taxes included, or calculated based on shipping address
    // Removed totalWeight as it's not currently used in the UI
    // const totalWeight = cartItems.reduce((acc, item) => acc + (item.weight || 0) * item.quantity, 0); // Assuming products have a 'weight' property

    const calculateTotalPrice = () => {
        return calculateSubtotal() - totalDiscount + taxes;
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            showMessageBox('Your cart is empty!', 'info');
            return;
        }
        // Removed check for agreedToTerms as the checkbox is no longer present
        // if (!agreedToTerms) {
        //     showMessageBox('Please agree to the terms and conditions to proceed.', 'error');
        //     return;
        // }
        navigate('/checkout');
    };

    // Functions to open and close the product detail modal (copied from ProductBrowsePage)
    const openProductModal = async (product) => {
        // If the cart item doesn't have all details, fetch them
        if (!product.description || !product.reviews) {
            try {
                const res = await authAxios.get(`/products/${product._id}`);
                setSelectedProduct(res.data);
                // Set the main image to the product's primary image or first additional image
                const images = [res.data.imageUrl, ...(res.data.additionalImages || [])].filter(Boolean);
                setCurrentModalImage(images.length > 0 ? images[0] : 'https://placehold.co/400x300/e0f2f7/3498db?text=Product');
            } catch (err) {
                showMessageBox('Failed to load product details.', 'error');
                console.error('Failed to fetch product details for modal:', err);
                return;
            }
        } else {
            setSelectedProduct(product);
            const images = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);
            setCurrentModalImage(images.length > 0 ? images[0] : 'https://placehold.co/400x300/e0f2f7/3498db?text=Product');
        }
        setIsModalOpen(true);
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
        setCurrentModalImage(''); // Clear current modal image on close
    };

    // Custom message box function (re-used from CheckoutPage)
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

    // Helper to render stars (re-used from ProductDetailPage)
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={i <= rating ? 'fas fa-star' : (i - 0.5 <= rating ? 'fas fa-star-half-alt' : 'far fa-star')}
                    style={starStyle(i <= rating)}
                ></i>
            );
        }
        return stars;
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
                    <div style={cartLayoutGridStyle}> {/* New grid for layout */}
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
                                                    <span
                                                        style={productNameInCartStyle}
                                                        onClick={() => openProductModal(item)} // Make product name clickable
                                                    >
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={tableBodyCellStyle}>${item.price.toFixed(2)}</td>
                                            <td style={tableBodyCellStyle}>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                                                    min="1"
                                                    max={item.stockQuantity} // Limit quantity by stock
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
                            {/* Coupon section below the table, within the same grid column */}
                            <div style={couponSectionBelowTableStyle}>
                                <div style={couponInputGroupStyle}>
                                    <input
                                        type="text"
                                        id="coupon"
                                        placeholder="Promo Code Here"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        style={couponInputBelowTableStyle}
                                    />
                                    <button style={applyCouponButtonBelowTableStyle}>Apply</button>
                                </div>
                                <button style={updateCartButtonBelowTableStyle}>Update Cart</button>
                            </div>
                        </div>

                        <div style={cartSummaryStyle}>
                            <h3 style={summaryTitleStyle}>Cart Totals</h3>

                            <div style={summaryDetailsStyle}>
                                <div style={summaryItemStyle}>
                                    <span>Subtotal:</span>
                                    <span style={summaryValueStyle}>${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div style={summaryItemStyle}>
                                    <span>Shipping:</span>
                                    <div style={shippingOptionsStyle}>
                                        <label style={shippingOptionLabelStyle}>
                                            <input type="radio" name="shipping" value="flat" defaultChecked style={shippingRadioStyle} /> Flat rate: $50.00
                                        </label>
                                        <label style={shippingOptionLabelStyle}>
                                            <input type="radio" name="shipping" value="free" style={shippingRadioStyle} /> Free Shipping
                                        </label>
                                        <span style={changeAddressLinkStyle}>Shipping to <a href="javascript:void(0);" style={termsLinkStyle}>Banaree, 1219 Dhaka</a></span>
                                        <a href="javascript:void(0);" style={termsLinkStyle}>Change Address</a>
                                    </div>
                                </div>
                            </div>

                            <div style={totalPriceStyle}>
                                <span>Total:</span>
                                <span style={summaryValueStyle}>${calculateTotalPrice().toFixed(2)}</span>
                            </div>

                            <button onClick={handleCheckout} style={checkoutButtonStyle}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Details Modal (Copied from ProductBrowsePage) */}
            {isModalOpen && selectedProduct && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <button onClick={closeProductModal} style={closeModalButtonStyle}>
                            &times;
                        </button>
                        <div style={modalProductDetailGridStyle}>
                            {/* Image Gallery */}
                            <div style={modalImageGalleryStyle}>
                                <img src={currentModalImage} alt={selectedProduct.name} style={modalMainImageStyle} />
                                {(selectedProduct.additionalImages && selectedProduct.additionalImages.length > 0) || selectedProduct.imageUrl ? (
                                    <div style={modalThumbnailContainerStyle}>
                                        {/* Always show primary image as first thumbnail */}
                                        {selectedProduct.imageUrl && (
                                            <img
                                                src={selectedProduct.imageUrl}
                                                alt={`${selectedProduct.name} primary thumbnail`}
                                                style={{
                                                    ...modalThumbnailImageStyle,
                                                    border: currentModalImage === selectedProduct.imageUrl ? '2px solid #007bff' : '2px solid #ddd'
                                                }}
                                                onClick={() => setCurrentModalImage(selectedProduct.imageUrl)}
                                            />
                                        )}
                                        {selectedProduct.additionalImages && selectedProduct.additionalImages.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`${selectedProduct.name} thumbnail ${idx + 1}`}
                                                style={{
                                                    ...modalThumbnailImageStyle,
                                                    border: currentModalImage === img ? '2px solid #007bff' : '2px solid #ddd'
                                                }}
                                                onClick={() => setCurrentModalImage(img)}
                                            />
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            {/* Product Info */}
                            <div style={modalProductInfoStyle}>
                                <h3 style={modalProductNameStyle}>{selectedProduct.name}</h3>
                                <p style={modalProductDescriptionStyle}>{selectedProduct.description}</p>
                                <p style={modalProductPriceStyle}>${selectedProduct.price.toFixed(2)}</p>
                                <p style={{ ...modalProductStockStyle, color: selectedProduct.stockQuantity > 0 ? '#28a745' : '#e74c3c' }}>
                                    {selectedProduct.stockQuantity > 0 ? `In Stock: ${selectedProduct.stockQuantity}` : 'Out of Stock'}
                                </p>

                                {/* Ratings */}
                                {selectedProduct.averageRating !== undefined && (
                                    <div style={modalRatingStyle}>
                                        <span style={modalRatingStarsStyle}>
                                            {'★'.repeat(Math.floor(selectedProduct.averageRating))}
                                            {'☆'.repeat(5 - Math.floor(selectedProduct.averageRating))}
                                        </span>
                                        <span style={modalNumReviewsStyle}>({selectedProduct.numReviews || 0} reviews)</span>
                                    </div>
                                )}

                                {/* Offers */}
                                {selectedProduct.offers && selectedProduct.offers.length > 0 && (
                                    <div style={modalOffersStyle}>
                                        <h4 style={modalSectionHeaderStyle}>Special Offers:</h4>
                                        <ul style={modalOfferListStyle}>
                                            {selectedProduct.offers.map((offer, idx) => (
                                                <li key={idx} style={modalOfferItemStyle}>
                                                    <i className="fas fa-tag" style={{ marginRight: '8px', color: '#f39c12' }}></i>{offer}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div style={modalButtonContainerStyle}>
                                    {/* These buttons are for the modal, not directly for cart actions */}
                                    <button
                                        onClick={() => { closeProductModal(); }}
                                        style={{ ...modalAddToCartButtonStyle, backgroundColor: '#6c757d' }}
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Customer Reviews Section */}
                        {selectedProduct.reviews && selectedProduct.reviews.length > 0 && (
                            <div style={modalReviewsSectionStyle}>
                                <h4 style={modalSectionHeaderStyle}>Customer Reviews:</h4>
                                {selectedProduct.reviews.map((review, idx) => (
                                    <div key={idx} style={modalReviewItemStyle}>
                                        <p style={modalReviewHeaderStyle}>
                                            <strong>{review.customerName}</strong>
                                            <span style={modalReviewStarsStyle}>
                                                {'★'.repeat(review.rating)}
                                                {'☆'.repeat(5 - review.rating)}
                                            </span>
                                        </p>
                                        <p style={modalReviewCommentStyle}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Inline Styles for Beautiful UI ---
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

// New: Grid for cart layout
const cartLayoutGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr', // Changed to 1 column for all screen sizes
    gap: '30px',
    width: '100%',
    maxWidth: '1200px',
    // Removed media query as it's now always 1 column
};

const cartTableContainerStyle = {
    width: '100%',
    overflowX: 'auto',
    marginBottom: '0', // Removed bottom margin as it's part of grid
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

const productNameInCartStyle = { // Specific style for clickable product name in cart
    fontWeight: '600',
    fontSize: '1.1em',
    color: '#007bff',
    cursor: 'pointer',
    transition: 'text-decoration 0.2s ease',
    ':hover': {
        textDecoration: 'underline',
    },
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

// New styles for coupon section below the table
const couponSectionBelowTableStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
    gap: '15px', // Gap between items
};

const couponInputGroupStyle = {
    display: 'flex',
    flexGrow: 1,
    gap: '10px',
    maxWidth: '350px', // Limit width for coupon input
};

const couponInputBelowTableStyle = {
    flexGrow: 1,
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

const applyCouponButtonBelowTableStyle = {
    padding: '12px 20px',
    backgroundColor: '#ff6b6b', // Reddish orange
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(255, 107, 107, 0.3)',
    ':hover': {
        backgroundColor: '#ff4757',
        transform: 'translateY(-2px)',
    },
};

const updateCartButtonBelowTableStyle = {
    padding: '12px 25px',
    backgroundColor: '#007bff', // Blue
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
    ':hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-2px)',
    },
};


// Updated Cart Summary Styles to match image
const cartSummaryStyle = {
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: '25px', // Reduced padding for smaller size
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px', // Reduced gap for more compact layout
};

const summaryTitleStyle = {
    fontSize: '1.6em', // Slightly smaller title
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '15px', // Reduced margin
    borderBottom: '1px solid #eee',
    paddingBottom: '8px', // Reduced padding
};

const summaryDetailsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px', // Reduced gap
    paddingBottom: '15px', // Reduced padding
    borderBottom: '1px dashed #ddd',
};

const summaryItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95em', // Slightly smaller font
    color: '#555',
};

const summaryValueStyle = {
    fontWeight: 'bold',
    color: '#333',
};

const shippingOptionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '5px',
    fontSize: '0.9em',
    color: '#777',
};

const shippingOptionLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
};

const shippingRadioStyle = {
    marginRight: '5px',
};

const changeAddressLinkStyle = {
    fontSize: '0.85em',
    color: '#007bff',
    textDecoration: 'none',
    marginTop: '5px',
    ':hover': {
        textDecoration: 'underline',
    },
};


const totalPriceStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.6em', // Slightly smaller total price
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '8px', // Reduced margin
};

const checkoutButtonStyle = {
    width: '100%',
    padding: '15px 25px', // Reduced padding
    backgroundColor: '#ff6b6b', // Reddish orange for checkout
    color: 'white',
    border: 'none',
    borderRadius: '8px', // Slightly less rounded
    cursor: 'pointer',
    fontSize: '1.2em', // Slightly smaller font
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 5px 12px rgba(255, 107, 107, 0.3)', // Smaller shadow
    ':hover': {
        backgroundColor: '#ff4757',
        transform: 'translateY(-2px)',
    },
};

// --- Modal Styles (Copied from ProductBrowsePage.js) ---
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-out',
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '25px', // Reduced padding
    borderRadius: '15px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)', // Deeper shadow for modal
    width: '95%',
    maxWidth: '750px', // Reduced max-width
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    animation: 'zoomIn 0.3s ease-out',
    display: 'flex',
    flexDirection: 'column',
};

const closeModalButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '2em',
    color: '#999',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    ':hover': {
        color: '#333',
    },
};

const modalProductDetailGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr', // Stack on small screens
    gap: '20px', // Reduced gap
    marginBottom: '20px', // Reduced margin
    '@media (min-width: 768px)': {
        gridTemplateColumns: '1fr 1.2fr', // Image slightly wider than info
    },
};

const modalImageGalleryStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px', // Reduced gap
};

const modalMainImageStyle = {
    width: '100%',
    height: 'auto',
    maxHeight: '350px', // Reduced max height for main image
    objectFit: 'contain',
    borderRadius: '10px',
    border: '1px solid #eee',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
};

const modalThumbnailContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '8px', // Reduced gap
    marginTop: '10px',
};

const modalThumbnailImageStyle = {
    width: '70px', // Reduced thumbnail size
    height: '70px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #ddd',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, transform 0.2s ease',
    ':hover': {
        borderColor: '#007bff',
        transform: 'scale(1.05)',
    },
};

const modalProductInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const modalProductNameStyle = {
    fontSize: '2.2em', // Slightly reduced font size
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '8px', // Reduced margin
    lineHeight: '1.2',
};

const modalProductDescriptionStyle = {
    fontSize: '1em', // Slightly reduced font size
    color: '#555',
    marginBottom: '15px', // Reduced margin
    lineHeight: '1.6',
};

const modalProductPriceStyle = {
    fontSize: '1.8em', // Slightly reduced font size
    fontWeight: '800',
    color: '#007bff',
    marginBottom: '10px',
};

const modalProductStockStyle = {
    fontSize: '0.95em',
    fontWeight: '600',
    marginBottom: '15px', // Reduced margin
};

const modalRatingStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px', // Reduced margin
    color: '#f39c12', // Star color
    fontSize: '1.1em', // Slightly reduced font size
};

const modalRatingStarsStyle = {
    marginRight: '8px', // Reduced margin
};

const modalNumReviewsStyle = {
    fontSize: '0.85em', // Slightly reduced font size
    color: '#777',
    fontWeight: 'normal',
};

const modalOffersStyle = {
    marginBottom: '25px', // Reduced margin
    padding: '12px', // Reduced padding
    backgroundColor: '#fffbe6',
    border: '1px dashed #f39c12',
    borderRadius: '8px',
};

const modalSectionHeaderStyle = {
    fontSize: '1.3em', // Slightly reduced font size
    color: '#34495e',
    marginBottom: '12px', // Reduced margin
    fontWeight: '600',
    borderBottom: '1px solid #eee',
    paddingBottom: '6px', // Reduced padding
};

const modalOfferListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
};

const modalOfferItemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px', // Reduced margin
    fontSize: '0.95em',
    color: '#555',
};

const modalButtonContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto',
    width: '100%',
};

const modalAddToCartButtonStyle = {
    padding: '12px 15px', // Slightly reduced padding
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1em', // Slightly reduced font size
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 15px rgba(46, 204, 113, 0.3)',
    flex: 1,
    ':hover': {
        backgroundColor: '#27ae60',
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 20px rgba(46, 204, 113, 0.4)',
    },
    ':disabled': {
        backgroundColor: '#a0d9b4',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
};

// Removed modalBuyNowButtonStyle as it was unused
// const modalBuyNowButtonStyle = {
//     padding: '12px 15px',
//     color: 'white',
//     border: 'none',
//     borderRadius: '10px',
//     cursor: 'pointer',
//     fontSize: '1.1em',
//     fontWeight: 'bold',
//     transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
//     boxShadow: '0 6px 15px rgba(0, 123, 255, 0.3)',
//     flex: 1,
//     ':hover': {
//         backgroundColor: '#0056b3',
//         transform: 'translateY(-3px)',
//         boxShadow: '0 8px 20px rgba(0, 123, 255, 0.4)',
//     },
//     ':disabled': {
//         backgroundColor: '#a0c8f8',
//         cursor: 'not-allowed',
//         boxShadow: 'none',
//         transform: 'none',
//     },
// };

const modalReviewsSectionStyle = {
    marginTop: '30px', // Reduced margin
    paddingTop: '20px', // Reduced padding
    borderTop: '2px solid #f0f2f5',
};

const modalReviewItemStyle = {
    backgroundColor: '#f9f9f9',
    padding: '15px', // Reduced padding
    borderRadius: '10px',
    marginBottom: '10px', // Reduced margin
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', // Softer shadow
};

const modalReviewHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px', // Reduced margin
    fontSize: '1em', // Slightly reduced font size
    fontWeight: 'bold',
    color: '#333',
};

const modalReviewStarsStyle = {
    color: '#f39c12',
    fontSize: '0.9em', // Slightly reduced font size for stars in reviews
};

const modalReviewCommentStyle = {
    fontSize: '0.9em', // Slightly reduced font size
    color: '#666',
    lineHeight: '1.5',
};

const starStyle = (filled) => ({
    marginRight: '2px',
    transition: 'color 0.2s ease',
    color: filled ? '#f39c12' : '#ccc', // Filled stars are gold, empty are light grey
});

const termsLinkStyle = { // Defined termsLinkStyle globally
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'text-decoration 0.2s ease',
    ':hover': {
        textDecoration: 'underline',
    },
};

// Keyframes for animations (ensure these are in your client/src/index.css)
/*
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translate(-50%, -50%); }
    to { opacity: 0; transform: translate(-50%, -60%); }
}

@keyframes zoomIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
*/

export default CartPage;
