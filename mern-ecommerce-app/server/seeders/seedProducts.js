// server/seeders/seedProducts.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product'); // Ensure this path is correct to your Product model
const connectDB = require('../config/db'); // Ensure this path is correct to your DB connection utility

// Load environment variables from the .env file in the parent (server) directory
dotenv.config({ path: '../.env' });

// Connect to the database
connectDB();

// Sample product data matching your ProductSchema
const sampleProducts = [
    {
        name: 'Classic Wireless Mouse',
        description: 'An ergonomic wireless mouse for everyday use, with long-lasting battery.',
        price: 25.99,
        stockQuantity: 150,
        imageUrl: 'https://placehold.co/400x300/e0f2f7/3498db?text=Wireless+Mouse',
    },
    {
        name: 'Mechanical Gaming Keyboard',
        description: 'High-performance mechanical keyboard with RGB backlighting and customizable keys for serious gamers.',
        price: 89.99,
        stockQuantity: 75,
        imageUrl: 'https://placehold.co/400x300/d4edda/28a745?text=Gaming+Keyboard',
    },
    {
        name: 'Ultra HD 4K Monitor (27-inch)',
        description: 'Stunning 4K resolution on a 27-inch display, perfect for design and entertainment.',
        price: 349.00,
        stockQuantity: 40,
        imageUrl: 'https://placehold.co/400x300/ffeeba/ffc107?text=4K+Monitor',
    },
    {
        name: 'Portable Bluetooth Speaker',
        description: 'Compact and powerful speaker with rich bass and 10-hour battery life.',
        price: 49.99,
        stockQuantity: 200,
        imageUrl: 'https://placehold.co/400x300/f8d7da/dc3545?text=Bluetooth+Speaker',
    },
    {
        name: 'Noise Cancelling Headphones',
        description: 'Immerse yourself in pure sound with advanced noise cancellation technology.',
        price: 129.99,
        stockQuantity: 90,
        imageUrl: 'https://placehold.co/400x300/cce5ff/007bff?text=Headphones',
    },
    {
        name: 'Webcam 1080p Full HD',
        description: 'Crystal clear video calls with a wide-angle lens and auto-focus.',
        price: 39.99,
        stockQuantity: 120,
        imageUrl: 'https://placehold.co/400x300/e2e3e5/6c757d?text=Webcam',
    },
    {
        name: 'External SSD 1TB',
        description: 'Lightning-fast external solid-state drive for all your storage needs.',
        price: 119.00,
        stockQuantity: 60,
        imageUrl: 'https://placehold.co/400x300/d1ecf1/17a2b8?text=External+SSD',
    },
    {
        name: 'USB-C Hub Multiport Adapter',
        description: 'Expand your laptop\'s connectivity with multiple ports including HDMI, USB 3.0, and SD card reader.',
        price: 29.50,
        stockQuantity: 180,
        imageUrl: 'https://placehold.co/400x300/fcf8e3/856404?text=USB-C+Hub',
    },
    {
        name: 'Smart Home LED Light Bulb',
        description: 'Control your lighting from anywhere with this Wi-Fi enabled smart bulb. Dimmable and color-changing.',
        price: 15.00,
        stockQuantity: 300,
        imageUrl: 'https://placehold.co/400x300/dae0e5/0056b3?text=Smart+Bulb',
    },
    {
        name: 'Portable Laptop Stand',
        description: 'Adjustable aluminum laptop stand for ergonomic viewing and improved airflow.',
        price: 35.00,
        stockQuantity: 100,
        imageUrl: 'https://placehold.co/400x300/f8f9fa/333333?text=Laptop+Stand',
    },
    {
        name: 'Gaming Mouse Pad XL',
        description: 'Large surface, optimized for gaming sensors, with anti-slip rubber base.',
        price: 19.99,
        stockQuantity: 250,
        imageUrl: 'https://placehold.co/400x300/e9ecef/495057?text=Mouse+Pad',
    },
    {
        name: 'Ergonomic Vertical Mouse',
        description: 'Designed to reduce wrist strain, promoting a natural handshake position.',
        price: 45.00,
        stockQuantity: 80,
        imageUrl: 'https://placehold.co/400x300/f0f2f5/2c3e50?text=Vertical+Mouse',
    },
    {
        name: 'High-Speed HDMI Cable (6ft)',
        description: 'Premium braided HDMI cable supporting 4K @ 60Hz and HDR.',
        price: 12.99,
        stockQuantity: 400,
        imageUrl: 'https://placehold.co/400x300/ced4da/666666?text=HDMI+Cable',
    },
    {
        name: 'Universal Travel Adapter',
        description: 'All-in-one adapter with USB ports, compatible with outlets worldwide.',
        price: 22.00,
        stockQuantity: 150,
        imageUrl: 'https://placehold.co/400x300/dee2e6/888888?text=Travel+Adapter',
    },
    {
        name: 'Wireless Charging Pad',
        description: 'Fast wireless charging for compatible smartphones and devices.',
        price: 29.99,
        stockQuantity: 110,
        imageUrl: 'https://placehold.co/400x300/e9ecef/1a202c?text=Charging+Pad',
    }
];

// Function to import data
const importData = async () => {
    try {
        await Product.deleteMany(); // Clears all existing products
        await Product.insertMany(sampleProducts); // Inserts new sample products
        console.log('Sample Products Data Imported Successfully!');
        process.exit(); // Exit the process after completion
    } catch (error) {
        console.error(`Error importing data: ${error}`);
        process.exit(1); // Exit with error code
    }
};

// Function to destroy all data
const destroyData = async () => {
    try {
        await Product.deleteMany(); // Clears all products
        console.log('All Products Data Destroyed!');
        process.exit(); // Exit the process after completion
    } catch (error) {
        console.error(`Error destroying data: ${error}`);
        process.exit(1); // Exit with error code
    }
};

// Check command line arguments to determine action
if (process.argv[2] === '-d') {
    destroyData(); // Run with `node server/seeders/seedProducts.js -d` to destroy
} else {
    importData(); // Run with `node server/seeders/seedProducts.js` to import
}
