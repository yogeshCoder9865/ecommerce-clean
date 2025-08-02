const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private/Customer (or Admin impersonating)
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress } = req.body;

    console.log('--- Inside createOrder Controller ---');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('User from req.user:', req.user ? req.user.email : 'N/A');

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    let totalAmount = 0;
    const productsInOrder = [];

    for (const item of orderItems) {
        const productId = item.productId || item._id;

        if (!productId) {
            return res.status(400).json({ message: 'A product in the order is missing a valid ID.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: `Product with ID ${productId} not found` });
        }

        if (product.stockQuantity < item.quantity) {
            return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.stockQuantity}` });
        }

        productsInOrder.push({
            product: product._id,
            quantity: item.quantity,
            priceAtOrder: product.price,
        });

        totalAmount += product.price * item.quantity;
        product.stockQuantity -= item.quantity;
        await product.save();
    }

    const order = await Order.create({
        user: req.user._id,
        products: productsInOrder,
        shippingAddress,
        totalAmount,
    });

    res.status(201).json(order);
});

// @desc    Get logged in user orders (customer)
// @route   GET /api/orders/myorders
// @access  Private/Customer
const getMyOrders = asyncHandler(async (req, res) => {
 console.log('--- Inside getMyOrders Controller ---');
console.log('User ID from req.user._id:', req.user?._id);
console.log('User email:', req.user?.email);

    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('Not authorized, user ID not found.');
    }

    const orders = await Order.find({ user: req.user._id })
        .populate('products.product', 'name price imageUrl')
        .sort({ createdAt: -1 });

    res.json(orders || []);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, customerEmail } = req.query;

    let filter = {};
    if (status && status !== 'All') filter.status = status;

    if (customerEmail) {
        const user = await User.findOne({ email: { $regex: customerEmail, $options: 'i' } });
        if (user) {
            filter.user = user._id;
        } else {
            return res.json({ orders: [], page: parseInt(page), pages: 0 });
        }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
        .populate('user', 'firstName lastName email')
        .populate('products.product', 'name price imageUrl')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const count = await Order.countDocuments(filter);
    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({ orders, page: parseInt(page), pages: totalPages, totalOrders: count });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin or Owner)
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'firstName lastName email')
        .populate('products.product', 'name price imageUrl');

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
        res.json(order);
    } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
    }
});

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (status === 'Cancelled') {
        // Allow user to cancel if it's their own order and still cancelable
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }
        if (order.status === 'Shipped' || order.status === 'Delivered') {
            return res.status(400).json({ message: 'Cannot cancel a shipped or delivered order' });
        }

        order.status = 'Cancelled';
        order.updatedAt = Date.now();
        const updated = await order.save();
        return res.json(updated);
    }

    // Allow only admin to change to other statuses
    if (!isAdmin) {
        return res.status(403).json({ message: 'Only admin can update this order status' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Admin: Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stockQuantity += item.quantity;
            await product.save();
        }
    }

    await order.deleteOne();
    res.json({ message: 'Order removed' });
});

// ✅ @desc    Customer cancels their own order
// ✅ @route   PUT /api/orders/:id/cancel
// ✅ @access  Private (Customer only)
const cancelMyOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to cancel this order' });
    }

    if (order.status === 'Delivered') {
        return res.status(400).json({ message: 'Order already delivered and cannot be cancelled' });
    }

    if (order.status === 'Cancelled') {
        return res.status(400).json({ message: 'Order is already cancelled' });
    }

    order.status = 'Cancelled';
    order.updatedAt = Date.now();

    for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stockQuantity += item.quantity;
            await product.save();
        }
    }

    const cancelledOrder = await order.save();
    res.json({ message: 'Order cancelled successfully', order: cancelledOrder });
});

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    cancelMyOrder, // ✅ Export the cancel order controller
};
