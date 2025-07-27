// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createOrder) // Customer/Impersonated Admin
    .get(protect, authorizeRoles('admin'), getAllOrders); // Admin only

router.get('/myorders', protect, getMyOrders); // Customer only

router.route('/:id')
    .get(protect, getOrderById) // Admin or Order Owner
    .delete(protect, authorizeRoles('admin'), deleteOrder); // Admin only

router.put('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus); // Admin only

module.exports = router;