// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
    .get(getProducts) // Publicly accessible to browse
    .post(protect, authorizeRoles('admin'), createProduct); // Admin only

router.route('/:id')
    .get(getProductById) // Publicly accessible to view details
    .put(protect, authorizeRoles('admin'), updateProduct) // Admin only
    .delete(protect, authorizeRoles('admin'), deleteProduct); // Admin only

module.exports = router;