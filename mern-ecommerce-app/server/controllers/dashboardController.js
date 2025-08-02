// server/controllers/dashboardController.js

const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product'); // Import the Product model

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/statistics
// @access  Private/Admin
exports.getDashboardStatistics = async (req, res) => {
    // 1. Role Check: Ensure the user is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Only administrators can view dashboard statistics.' });
    }

    try {
        // 2. Initialize Statistics Collection (within try-catch block)

        // Fetch Total Users (customers)
        const totalUsers = await User.countDocuments({ role: 'customer' });

        // Fetch Total Orders
        const totalOrders = await Order.countDocuments();

        // Fetch Total Products (NEW ADDITION)
        const totalProducts = await Product.countDocuments(); // Count all products

        // Calculate Total Revenue from Delivered Orders
        const totalRevenueResult = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        // Fetch Pending Orders (status 'Pending' or 'Processing')
        const pendingOrders = await Order.countDocuments({
            status: { $in: ['Pending', 'Processing'] }
        });

        // 7. Send Response
        res.status(200).json({
            totalUsers,
            totalOrders,
            totalProducts, // Include totalProducts in the response
            totalRevenue: totalRevenue.toFixed(2), // Format to two decimal places
            pendingOrders
        });

    } catch (error) {
        // 8. Error Handling
        console.error('Error fetching dashboard statistics:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard statistics.' });
    }
};

// You might have other controller functions here, keep them as is.
// For example:
// exports.createProduct = async (req, res) => { ... };
// exports.getAllUsers = async (req, res) => { ... };
