// client/src/pages/customer/ProductBrowsePage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; // Corrected import statement
import CustomerNav from '../../components/customer/CustomerNav';
import { useNavigate } from 'react-router-dom';
const BACKEND_URL = 'http://localhost:5000';
const ProductBrowsePage = () => {
    const { authAxios } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [combinedSort, setCombinedSort] = useState('createdAt-desc');
    const [selectedCategory, setSelectedCategory] = useState('All'); // New state for category filter
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12;

    // New states for product detail modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State to manage which image is currently displayed in the modal's main image area
    const [currentModalImage, setCurrentModalImage] = useState('');

    // Hardcoded categories for demonstration. In a real app, these would come from the backend.
    const categories = [
        'All', 'Laptops', 'PCs', 'Mobile Phones', 'Tablets', 'Smartwatches', 'Drones', 'Cameras',
        'Networking', 'Storage', 'Peripherals', 'Gadgets', 'Accessories', 'Circuit Boards', 'Smart Home'
    ];
    
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');

            const [sortBy, sortOrder] = combinedSort.split('-');
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: searchQuery,
                sortBy: sortBy,
                order: sortOrder,
            };

            if (selectedCategory !== 'All') {
                params.category = selectedCategory;
            }

            try {
                const res = await authAxios.get(`/products`, { params });
                setProducts(res.data.products);
                setTotalPages(res.data.pages);
            } catch (err) {
                setError('Failed to fetch products. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [authAxios, currentPage, searchQuery, combinedSort, selectedCategory]); // Add selectedCategory to dependencies

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleCombinedSortChange = (e) => {
        setCombinedSort(e.target.value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (e) => { // New handler for category change
        setSelectedCategory(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Functions to open and close the product detail modal
    const openProductModal = (product) => {
        setSelectedProduct(product);
        // Set the main image to the product's primary image or first additional image
        const images = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);
        setCurrentModalImage(images.length > 0 ? images[0] : 'https://placehold.co/400x300/e0f2f7/3498db?text=Product');
        setIsModalOpen(true);
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
        setCurrentModalImage(''); // Clear current modal image on close
    };

    const addToCart = (product) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item._id === product._id);

        if (existingItemIndex > -1) {
            if (cart[existingItemIndex].quantity < product.stockQuantity) {
                cart[existingItemIndex].quantity += 1;
                showMessageBox(`${product.name} quantity updated in cart!`, 'success');
            } else {
                showMessageBox(`Cannot add more ${product.name}. Maximum stock reached.`, 'error');
                return;
            }
        } else {
            if (product.stockQuantity > 0) {
                cart.push({ ...product, quantity: 1 });
                showMessageBox(`${product.name} added to cart!`, 'success');
            } else {
                showMessageBox(`${product.name} is out of stock.`, 'error');
                return;
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Current Cart:', cart);
    };

    const buyNow = (product) => {
        // Clear existing cart and add only this product
        const newCart = [{ ...product, quantity: 1 }];
        localStorage.setItem('cart', JSON.stringify(newCart));
        showMessageBox(`Proceeding to checkout with ${product.name}.`, 'info', () => {
            navigate('/checkout');
        });
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
                <h2 style={pageTitleStyle}>Explore Our Products</h2>
                <p style={pageDescriptionStyle}>Discover high-quality items for all your needs.</p>

                <div style={controlsContainerStyle}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={searchInputStyle}
                    />
                    <div style={sortFilterGroupStyle}>
                        <label htmlFor="combinedSort" style={labelStyle}>Sort by:</label>
                        <select id="combinedSort" value={combinedSort} onChange={handleCombinedSortChange} style={selectStyle}>
                            <option value="createdAt-desc">Newest Arrivals</option>
                            <option value="createdAt-asc">Oldest Arrivals</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A-Z</option>
                            <option value="name-desc">Name: Z-A</option>
                            <option value="stockQuantity-desc">In Stock First</option>
                        </select>
                    </div>
                    <div style={sortFilterGroupStyle}> {/* New category filter */}
                        <label htmlFor="categoryFilter" style={labelStyle}>Category:</label>
                        <select id="categoryFilter" value={selectedCategory} onChange={handleCategoryChange} style={selectStyle}>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && <p style={errorMessageStyle}>{error}</p>}

                {loading ? (
                    <div style={loadingContainerStyle}>
                        <div style={spinnerStyle}></div>
                        <p style={{ color: '#555', marginTop: '15px' }}>Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div style={noProductsMessageStyle}>
                        <p>No products found matching your criteria.</p>
                        <button onClick={() => { setSearchQuery(''); setCombinedSort('createdAt-desc'); setSelectedCategory('All'); setCurrentPage(1); }} style={resetFilterButtonStyle}>Reset Filters</button>
                    </div>
                ) : (
                    <>
                        <div style={productGridStyle}>
                            {products.map((product, index) => (
                                <div
                                    key={product._id}
                                    style={{ ...productCardStyle, animationDelay: `${index * 0.05}s` }}
                                >
                                   <img
                                        src={
                                            product.imageUrl?.startsWith('http')
                                            ? product.imageUrl
                                            : `${BACKEND_URL}${product.imageUrl}`
                                        }
                                        alt={product.name}
                                        style={productImageStyle}
                                        onClick={() => openProductModal(product)}
                                        />
                                        
                                    <div style={productCardContentStyle}>
                                        <h3 style={productNameStyle} onClick={() => openProductModal(product)}>{product.name}</h3>
                                        <p style={productPriceStyle}>${product.price.toFixed(2)}</p>

                                        {/* Star Rating on Card */}
                                        <div style={cardRatingStyle}>
                                            {renderStars(product.averageRating || 0)}
                                            <span style={cardReviewCountStyle}>({product.numReviews || 0})</span>
                                        </div>

                                        <p style={{ ...productStockStyle, color: product.stockQuantity > 0 ? '#28a745' : '#e74c3c' }}>
                                            {product.stockQuantity > 0 ? `In Stock: ${product.stockQuantity}` : 'Out of Stock'}
                                        </p>
                                        <div style={cardButtonContainerStyle}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                disabled={product.stockQuantity === 0}
                                                style={{ ...addToCartButtonStyle, backgroundColor: product.stockQuantity > 0 ? '#2ecc71' : '#a0d9b4' }}
                                            >
                                                {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); buyNow(product); }}
                                                disabled={product.stockQuantity === 0}
                                                style={{ ...buyNowButtonStyle, backgroundColor: product.stockQuantity > 0 ? '#007bff' : '#a0c8f8' }}
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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

                {/* Product Details Modal */}
                {isModalOpen && selectedProduct && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <button onClick={closeProductModal} style={closeModalButtonStyle}>
                                &times;
                            </button>
                            <div style={modalProductDetailGridStyle}>
                                {/* Image Gallery */}
                                <div style={modalImageGalleryStyle}>
                                    <img
                                        src={currentModalImage.startsWith('http') ? currentModalImage : `${BACKEND_URL}${currentModalImage}`}
                                        alt={selectedProduct.name}
                                        style={modalMainImageStyle}
                                        />
                                    {(selectedProduct.additionalImages && selectedProduct.additionalImages.length > 0) || selectedProduct.imageUrl ? (
                                        <div style={modalThumbnailContainerStyle}>
                                            {/* Always show primary image as first thumbnail */}
                                            {selectedProduct.imageUrl && (
                                                <img
                                                    src={selectedProduct.imageUrl.startsWith('http') ? selectedProduct.imageUrl : `${BACKEND_URL}${selectedProduct.imageUrl}`}
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
    src={img.startsWith('http') ? img : `${BACKEND_URL}${img}`}
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
                                        <button
                                            onClick={() => { addToCart(selectedProduct); closeProductModal(); }}
                                            disabled={selectedProduct.stockQuantity === 0}
                                            style={{ ...modalAddToCartButtonStyle, backgroundColor: selectedProduct.stockQuantity > 0 ? '#2ecc71' : '#a0d9b4' }}
                                        >
                                            {selectedProduct.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                        <button
                                            onClick={() => { buyNow(selectedProduct); closeProductModal(); }}
                                            disabled={selectedProduct.stockQuantity === 0}
                                            style={{ ...modalBuyNowButtonStyle, backgroundColor: selectedProduct.stockQuantity > 0 ? '#007bff' : '#a0c8f8' }}
                                        >
                                            Buy Now
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
        </div>
    );
};

// --- Inline Styles for Beautiful UI and Animations ---
const pageContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5', // Light background for the whole page
    fontFamily: 'Inter', // Consistent font
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
    fontSize: '2.8em',
    marginBottom: '10px',
    fontWeight: '700',
    textAlign: 'center',
};

const pageDescriptionStyle = {
    fontSize: '1.2em',
    color: '#555',
    marginBottom: '40px',
    textAlign: 'center',
};

const controlsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center controls
    alignItems: 'center',
    gap: '20px',
    marginBottom: '40px',
    width: '100%',
    maxWidth: '1000px',
    padding: '15px',
    backgroundColor: '#f5f7f9',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

const searchInputStyle = {
    padding: '12px 18px',
    width: '300px',
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

const sortFilterGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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

const spinnerStyle = {
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #3498db',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
};

const noProductsMessageStyle = {
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
    ':hover': {
        backgroundColor: '#5a6268',
        transform: 'translateY(-2px)',
    },
    ':active': {
        transform: 'translateY(0)',
    },
};

const productGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '50px',
};

const productCardStyle = {
    border: '1px solid #eee',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    animation: 'fadeInUp 0.6s ease-out forwards',
    opacity: 0,
    transform: 'translateY(20px)',
    cursor: 'pointer', // Added cursor pointer
    ':hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
    },
};

const productImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderBottom: '1px solid #eee',
    borderRadius: '12px 12px 0 0',
};

const productCardContentStyle = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
};

const productNameStyle = {
    margin: '0 0 10px 0',
    fontSize: '1.4em',
    color: '#333',
    fontWeight: '600',
    lineHeight: '1.3',
};

const productPriceStyle = {
    fontWeight: '700',
    fontSize: '1.2em',
    color: '#007bff',
    marginBottom: '10px',
};

const productStockStyle = {
    fontSize: '0.95em',
    marginBottom: '20px',
    fontWeight: '500',
};

const cardButtonContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto', // Pushes buttons to the bottom
};

const addToCartButtonStyle = {
    padding: '12px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)',
    flex: 1, // Distribute space
    ':hover': {
        backgroundColor: '#27ae60',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 15px rgba(46, 204, 113, 0.4)',
    },
    ':disabled': {
        backgroundColor: '#a0d9b4',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
};

const buyNowButtonStyle = {
    padding: '12px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
    flex: 1, // Distribute space
    ':hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 15px rgba(0, 123, 255, 0.4)',
    },
    ':disabled': {
        backgroundColor: '#a0c8f8',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
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

// --- New Styles for Product Detail Modal ---
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

const modalBuyNowButtonStyle = {
    padding: '12px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 15px rgba(0, 123, 255, 0.3)',
    flex: 1,
    ':hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 20px rgba(0, 123, 255, 0.4)',
    },
    ':disabled': {
        backgroundColor: '#a0c8f8',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
};

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

// New styles for stars on product cards
const cardRatingStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    color: '#f39c12', // Star color
    fontSize: '1em',
};

const starStyle = (filled) => ({
    marginRight: '2px',
    transition: 'color 0.2s ease',
    color: filled ? '#f39c12' : '#ccc', // Filled stars are gold, empty are light grey
});

const cardReviewCountStyle = {
    fontSize: '0.8em',
    color: '#777',
    fontWeight: 'normal',
    marginLeft: '5px',
};


// Keyframes for animations (ensure these are in your client/src/index.css)
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

@keyframes zoomIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
*/


export default ProductBrowsePage;
