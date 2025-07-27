// client/src/pages/customer/ProductBrowsePage.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import CustomerNav from '../../components/customer/CustomerNav';

const ProductBrowsePage = () => {
    const { authAxios } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('createdAt'); // Default to newest
    const [sortOrder, setSortOrder] = useState('desc'); // Default to descending
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12; // Adjusted for a more compact grid

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await authAxios.get(`/products`, {
                    params: {
                        page: currentPage,
                        limit: itemsPerPage,
                        search: searchQuery,
                        sortBy: sortBy,
                        order: sortOrder,
                    },
                });
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
    }, [authAxios, currentPage, searchQuery, sortBy, sortOrder]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1); // Reset to first page on sort change
    };

    const handleOrderChange = (e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1); // Reset to first page on order change
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const addToCart = (product) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item._id === product._id);

        if (existingItemIndex > -1) {
            // If item exists, increment quantity, but don't exceed stock
            if (cart[existingItemIndex].quantity < product.stockQuantity) {
                cart[existingItemIndex].quantity += 1;
                showMessageBox(`${product.name} quantity updated in cart!`);
            } else {
                showMessageBox(`Cannot add more ${product.name}. Maximum stock reached.`);
                return;
            }
        } else {
            // Add new item to cart if stock is available
            if (product.stockQuantity > 0) {
                cart.push({ ...product, quantity: 1 });
                showMessageBox(`${product.name} added to cart!`);
            } else {
                showMessageBox(`${product.name} is out of stock.`);
                return;
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Current Cart:', cart);
    };

    // Custom message box function (re-used from CheckoutPage)
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
                        <label htmlFor="sortBy" style={labelStyle}>Sort by:</label>
                        <select id="sortBy" value={sortBy} onChange={handleSortChange} style={selectStyle}>
                            <option value="createdAt">Newest</option>
                            <option value="name">Name</option>
                            <option value="price">Price</option>
                            <option value="stockQuantity">Stock</option>
                        </select>
                        <select value={sortOrder} onChange={handleOrderChange} style={selectStyle}>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
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
                        <button onClick={() => { setSearchQuery(''); /* Removed setFilterStatus('All') */ setCurrentPage(1); }} style={resetFilterButtonStyle}>Reset Filters</button>
                    </div>
                ) : (
                    <>
                        <div style={productGridStyle}>
                            {products.map((product, index) => (
                                <div key={product._id} style={{ ...productCardStyle, animationDelay: `${index * 0.05}s` }}>
                                    <img src={product.imageUrl || 'https://placehold.co/400x300/e0f2f7/3498db?text=Product'} alt={product.name} style={productImageStyle} />
                                    <div style={productCardContentStyle}>
                                        <h3 style={productNameStyle}>{product.name}</h3>
                                        <p style={productPriceStyle}>${product.price.toFixed(2)}</p>
                                        <p style={{ ...productStockStyle, color: product.stockQuantity > 0 ? '#28a745' : '#e74c3c' }}>
                                            {product.stockQuantity > 0 ? `In Stock: ${product.stockQuantity}` : 'Out of Stock'}
                                        </p>
                                        <button
                                            onClick={() => addToCart(product)}
                                            disabled={product.stockQuantity === 0}
                                            style={{ ...addToCartButtonStyle, backgroundColor: product.stockQuantity > 0 ? '#2ecc71' : '#a0d9b4' }}
                                        >
                                            {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
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
};

const productGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Flexible columns
    gap: '30px',
    width: '100%',
    maxWidth: '1200px', // Max width for the grid
    marginBottom: '50px',
};

const productCardStyle = {
    border: '1px solid #eee',
    borderRadius: '12px', // More rounded corners
    overflow: 'hidden',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)', // Softer, larger shadow
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    animation: 'fadeInUp 0.6s ease-out forwards', // Fade in and lift up
    opacity: 0, // Start invisible for animation
    transform: 'translateY(20px)', // Start lower for animation
    ':hover': {
        transform: 'translateY(-8px)', // Lift effect on hover
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)', // Enhanced shadow on hover
    },
};

const productImageStyle = {
    width: '100%',
    height: '200px', // Fixed height for consistent look
    objectFit: 'cover',
    borderBottom: '1px solid #eee',
    borderRadius: '12px 12px 0 0', // Rounded only top corners
};

const productCardContentStyle = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1, // Allows content to take available space
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
    color: '#007bff', // Blue for price
    marginBottom: '10px',
};

const productStockStyle = {
    fontSize: '0.95em',
    marginBottom: '20px',
    fontWeight: '500',
};

const addToCartButtonStyle = {
    padding: '12px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)',
    width: '100%',
    marginTop: 'auto', // Pushes button to the bottom of the card
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
*/


export default ProductBrowsePage;