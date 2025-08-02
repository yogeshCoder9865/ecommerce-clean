const express = require('express');
const router = express.Router();

const {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    cancelMyOrder // ✅ Import the new controller
} = require('../controllers/orderController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// @route   POST /orders
// @desc    Create new order (Customer)
// @access  Private
router.post('/', protect, createOrder);

// @route   GET /orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), getAllOrders);

// @route   GET /orders/myorders
// @desc    Get orders for logged-in user
// @access  Private
router.get('/myorders', protect, getMyOrders);

// ✅ NEW ROUTE: Customer cancels own order
// @route   PUT /orders/:id/cancel
// @desc    Cancel your own order if not delivered
// @access  Private
router.put('/:id/cancel', protect, cancelMyOrder);

// @route   GET /orders/:id
// @desc    Get order by ID (Admin or Order Owner)
// @access  Private
router.get('/:id', protect, getOrderById);

// @route   DELETE /orders/:id
// @desc    Delete order (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorizeRoles('admin'), deleteOrder);

// @route   PUT /orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
