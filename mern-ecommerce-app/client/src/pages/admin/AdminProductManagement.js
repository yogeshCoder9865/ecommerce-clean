// client/src/pages/admin/AdminProductManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import { useAuth } from '../../context/AuthContext'; // Corrected path for AuthContext

const AdminProductManagement = () => {
    const { authAxios } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for Edit Modal
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: '', stockQuantity: '' });
    const [editedProduct, setEditedProduct] = useState(null); // State to hold product being edited

    // --- Custom Message Box Functions ---
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

    // --- Function to fetch products (wrapped in useCallback) ---
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await authAxios.get('/products');
            setProducts(res.data.products || res.data);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [authAxios]); // fetchProducts only depends on authAxios

    // --- Effect to call fetchProducts on component mount (runs only once) ---
    useEffect(() => {
        fetchProducts(); // Call on mount
    }, []); // Empty dependency array ensures this runs only once

    // --- Handlers for Add Product Modal ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Ensure price and stockQuantity are numbers
        setNewProduct(prev => ({
            ...prev,
            [name]: (name === 'price' || name === 'stockQuantity') ? parseFloat(value) : value
        }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Basic validation
        if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category || newProduct.stockQuantity === '') {
            setError('All fields are required.');
            return;
        }
        if (newProduct.price < 0 || newProduct.stockQuantity < 0) {
            setError('Price and Stock Quantity cannot be negative.');
            return;
        }

        try {
            await authAxios.post('/products', newProduct);
            setNewProduct({ name: '', description: '', price: '', category: '', stockQuantity: '' }); // Reset form
            setIsAddModalOpen(false);
            showMessageBox('Product added successfully!', 'success', fetchProducts); // Re-fetch products after successful add
        } catch (err) {
            console.error('Failed to add product:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to add product. Please check your input.');
        }
    };

    // --- Handlers for Edit Product Modal ---
    const handleEditClick = (product) => {
        setEditedProduct({ ...product }); // Set the product to be edited
        setIsEditModalOpen(true); // Open the edit modal
        setError(''); // Clear any previous errors
        setSuccessMessage(''); // Clear any previous success messages
    };

    const handleEditModalChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({
            ...prev,
            [name]: (name === 'price' || name === 'stockQuantity') ? parseFloat(value) : value
        }));
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!editedProduct.name || !editedProduct.description || !editedProduct.price || !editedProduct.category || editedProduct.stockQuantity === '') {
            setError('All fields are required.');
            return;
        }
        if (editedProduct.price < 0 || editedProduct.stockQuantity < 0) {
            setError('Price and Stock Quantity cannot be negative.');
            return;
        }

        try {
            // Send PUT request to update the product
            await authAxios.put(`/products/${editedProduct._id}`, editedProduct);
            setIsEditModalOpen(false); // Close the modal
            showMessageBox('Product updated successfully!', 'success', fetchProducts); // Re-fetch products after successful update
        } catch (err) {
            console.error('Failed to update product:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to update product. Please check your input.');
        }
    };

    const handleDelete = async (productId) => {
        showConfirmBox(`Are you sure you want to delete product with ID: ${productId}?`, async () => {
            try {
                await authAxios.delete(`/products/${productId}`);
                showMessageBox('Product deleted successfully!', 'success', fetchProducts); // Re-fetch after delete
            } catch (err) {
                console.error('Failed to delete product:', err.response?.data?.message || err.message);
                setError(err.response?.data?.message || 'Failed to delete product.');
            }
        });
    };

    return (
        <div style={pageContainerStyle}>
            <AdminNav />
            <div style={contentAreaStyle}>
                <div style={headerContainerStyle}>
                    <h2 style={pageTitleStyle}>Product Management</h2>
                    <button
                        onClick={() => { setIsAddModalOpen(true); setError(''); setSuccessMessage(''); }} // Clear messages on open
                        style={addNewProductButtonStyle}
                    >
                        <i className="fas fa-plus-circle" style={{ marginRight: '8px' }}></i> Add New Product
                    </button>
                </div>

                {error && <p style={errorMessageStyle}>{error}</p>}
                {successMessage && <p style={successMessageStyle}>{successMessage}</p>}

                {loading ? (
                    <div style={loadingContainerStyle}>
                        <div style={spinnerStyle}></div>
                        <p style={{ color: '#555', marginTop: '15px' }}>Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div style={noProductsMessageStyle}>
                        <p>No products found. Click "Add New Product" to get started!</p>
                    </div>
                ) : (
                    <div style={tableContainerStyle}>
                        <table style={productsTableStyle}>
                            <thead>
                                <tr style={tableHeaderRowStyle}>
                                    <th style={tableHeaderCellStyle}>Image</th>
                                    <th style={tableHeaderCellStyle}>Name</th>
                                    <th style={tableHeaderCellStyle}>Category</th>
                                    <th style={tableHeaderCellStyle}>Price</th>
                                    <th style={tableHeaderCellStyle}>Stock</th>
                                    <th style={tableHeaderCellStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product._id} style={tableRowStyle}>
                                        <td style={tableImageCellStyle}>
                                            <img
                                                src={product.imageUrl || 'https://placehold.co/60x60/e0f2f7/3498db?text=Prod'}
                                                alt={product.name}
                                                style={productImageThumbnailStyle}
                                            />
                                        </td>
                                        <td style={tableCellStyle}>{product.name}</td>
                                        <td style={tableCellStyle}>{product.category}</td>
                                        <td style={tableCellStyle}>${product.price ? product.price.toFixed(2) : '0.00'}</td>
                                        <td style={tableCellStyle}>{product.stockQuantity}</td>
                                        <td style={tableActionCellStyle}>
                                            <button
                                                onClick={() => handleEditClick(product)} // Changed to handleEditClick
                                                style={{ ...actionButtonStyle, backgroundColor: '#007bff' }}
                                            >
                                                <i className="fas fa-edit"></i> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
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
                )}

                {/* --- Add Product Modal --- */}
                {isAddModalOpen && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <h3 style={modalTitleStyle}>Add New Product</h3>
                            {error && <p style={modalErrorMessageStyle}>{error}</p>}
                            <form onSubmit={handleAddProduct}>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Name:</label>
                                    <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} required style={modalInputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Description:</label>
                                    <textarea name="description" value={newProduct.description} onChange={handleInputChange} required style={{ ...modalInputStyle, minHeight: '80px' }}></textarea>
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Price:</label>
                                    <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} required min="0" step="0.01" style={modalInputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Category:</label>
                                    <input type="text" name="category" value={newProduct.category} onChange={handleInputChange} required style={modalInputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Stock Quantity:</label>
                                    <input type="number" name="stockQuantity" value={newProduct.stockQuantity} onChange={handleInputChange} required min="0" style={modalInputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Image URL (Optional):</label>
                                    <input type="text" name="imageUrl" value={newProduct.imageUrl} onChange={handleInputChange} style={modalInputStyle} placeholder="e.g., https://example.com/product.jpg" />
                                </div>
                                <div style={modalActionsStyle}>
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} style={modalCancelButtonStyle}>
                                        Cancel
                                    </button>
                                    <button type="submit" style={modalAddButtonStyle}>
                                        Add Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- Edit Product Modal --- */}
                {isEditModalOpen && editedProduct && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <h3 style={modalTitleStyle}>Edit Product</h3>
                            {error && <p style={modalErrorMessageStyle}>{error}</p>}
                            <form onSubmit={handleUpdateProduct}>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Name:</label>
                                    <input type="text" name="name" value={editedProduct.name} onChange={handleEditModalChange} required style={modalInputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Description:</label>
                                    <textarea name="description" value={editedProduct.description} onChange={handleEditModalChange} required style={{ ...modalInputStyle, minHeight: '80px' }}></textarea>
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Price:</label>
                                    <input type="number" name="price" value={editedProduct.price} onChange={handleEditModalChange} required min="0" step="0.01" style={modalInputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Category:</label>
                                    <input type="text" name="category" value={editedProduct.category} onChange={handleEditModalChange} required style={modalInputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Stock Quantity:</label>
                                    <input type="number" name="stockQuantity" value={editedProduct.stockQuantity} onChange={handleEditModalChange} required min="0" style={modalInputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={modalLabelStyle}>Image URL (Optional):</label>
                                    <input type="text" name="imageUrl" value={editedProduct.imageUrl} onChange={handleEditModalChange} style={modalInputStyle} placeholder="e.g., https://example.com/product.jpg" />
                                </div>
                                <div style={modalActionsStyle}>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} style={modalCancelButtonStyle}>
                                        Cancel
                                    </button>
                                    <button type="submit" style={modalAddButtonStyle}>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Inline Styles for Premium UI and Animations ---
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

const addNewProductButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#28a745', // Green for Add
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
        backgroundColor: '#218838',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 15px rgba(40, 167, 69, 0.4)',
    },
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

const tableContainerStyle = {
    width: '100%',
    maxWidth: '1200px',
    overflowX: 'auto',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    borderRadius: '10px',
    backgroundColor: '#fff',
    marginBottom: '40px',
};

const productsTableStyle = {
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

const tableImageCellStyle = {
    padding: '12px 15px',
    borderBottom: '1px solid #eee',
    width: '80px', // Fixed width for image column
};

const productImageThumbnailStyle = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #eee',
};

const tableCellStyle = {
    padding: '12px 15px',
    borderBottom: '1px solid #eee',
    color: '#333',
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
        backgroundColor: '#218838',
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
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'zoomIn 0.3s ease-out',
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

const formGroupStyle = {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
};

const modalLabelStyle = {
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555',
    fontSize: '0.95em',
};

const modalInputStyle = {
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

const modalActionsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '30px',
    gap: '15px',
};

const modalCancelButtonStyle = {
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

const modalAddButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)',
    ':hover': {
        backgroundColor: '#218838',
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

export default AdminProductManagement;
