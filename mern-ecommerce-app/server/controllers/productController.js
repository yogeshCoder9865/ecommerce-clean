// server/controllers/productController.js
const Product = require('../models/Product');
const Order = require('../models/Order'); // To check if product is in orders

// @desc    Get all products (with pagination, sorting, filtering)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const sort = {};
        if (req.query.sortBy && req.query.order) {
            sort[req.query.sortBy] = req.query.order === 'desc' ? -1 : 1;
        }

        const filter = {};
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' }; // Case-insensitive search
        }
        if (req.query.minPrice) filter.price = { ...filter.price, $gte: parseFloat(req.query.minPrice) };
        if (req.query.maxPrice) filter.price = { ...filter.price, $lte: parseFloat(req.query.maxPrice) };
        if (req.query.minStock) filter.stockQuantity = { ...filter.stockQuantity, $gte: parseInt(req.query.minStock) };
        if (req.query.maxStock) filter.stockQuantity = { ...filter.stockQuantity, $lte: parseInt(req.query.maxStock) };

        const products = await Product.find(filter)
            .sort(sort)
            .limit(limit)
            .skip(skip);

        const totalProducts = await Product.countDocuments(filter);

        res.json({
            products,
            page,
            pages: Math.ceil(totalProducts / limit),
            total: totalProducts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { name, description, price, stockQuantity, imageUrl } = req.body;
    try {
        const newProduct = await Product.create({
            name,
            description,
            price,
            stockQuantity,
            imageUrl
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { name, description, price, stockQuantity, imageUrl } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price !== undefined ? price : product.price;
            product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
            product.imageUrl = imageUrl || product.imageUrl;
            product.updatedAt = Date.now();

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if product exists in any orders
        const productInOrders = await Order.findOne({ 'products.product': req.params.id });
        if (productInOrders) {
            // Option 1: Prevent deletion
            return res.status(400).json({ message: 'Cannot delete product: it exists in one or more orders.' });
            // Option 2: Warn and cascade (more complex, consider status update instead of delete)
            // If you choose to allow deletion and cascade, you'd need to remove this product from all orders.
            // This is generally not recommended for historical order integrity.
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };