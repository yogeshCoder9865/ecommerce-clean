const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product'); // Ensure this path is correct to your Product model
const connectDB = require('../config/db'); // Ensure this path is correct to your DB connection utility

// Load environment variables from the .env file in the parent (server) directory
dotenv.config({ path: '../.env' });

// Connect to the database
connectDB();

// Helper function to generate random ratings and reviews
const generateRandomRating = () => parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)); // 3.0 to 5.0
const generateRandomReviews = (count) => {
    const reviews = [];
    const customerNames = ['Alice J.', 'Bob K.', 'Charlie L.', 'Diana M.', 'Eve N.', 'Frank O.', 'Grace P.', 'Henry Q.'];
    const comments = [
        'Absolutely love this product! Highly recommend.',
        'Great quality for the price. Very satisfied.',
        'Works as expected. No complaints.',
        'A solid purchase, performs well.',
        'Decent product, but could be improved.',
        'Not bad, but I had higher expectations.',
        'Very happy with this. Fast shipping too!',
        'Excellent value and features.',
        'Good product, easy to set up.',
        'Impressive performance, worth every penny.'
    ];

    for (let i = 0; i < count; i++) {
        reviews.push({
            customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
            rating: Math.floor(Math.random() * 3) + 3, // 3, 4, or 5 stars
            comment: comments[Math.floor(Math.random() * comments.length)],
        });
    }
    return reviews;
};

// Sample product data matching your ProductSchema
const sampleProducts = [
    {
        name: 'Gaming Laptop Pro 15',
        description: 'Unleash ultimate gaming performance with Intel Core i9, RTX 4080, and 32GB RAM. 15.6" QHD 240Hz display.',
        price: 1899.99,
        stockQuantity: 25,
        imageUrl: 'http://localhost:5000/uploads/1.jpg',
        additionalImages: [
            'https://placehold.co/400x300/a8dadc/1d3557?text=Laptop+Side',
            'https://placehold.co/400x300/a8dadc/1d3557?text=Laptop+Keyboard',
            'https://placehold.co/400x300/a8dadc/1d3557?text=Laptop+Ports'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 50) + 10,
        reviews: generateRandomReviews(3),
        offers: ['Free Gaming Headset', '10% off next purchase', 'Extended Warranty']
    },
    {
        name: 'UltraBook Air 13',
        description: 'Feather-light and powerful, perfect for on-the-go productivity. Intel Evo certified, 16GB RAM, 512GB SSD.',
        price: 1199.00,
        stockQuantity: 40,
        imageUrl: 'http://localhost:5000/uploads/2.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f1faee/457b9d?text=UltraBook+Slim',
            'https://placehold.co/400x300/f1faee/457b9d?text=UltraBook+Open'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 60) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Free Carrying Sleeve', 'Student Discount Available']
    },
    {
        name: 'Budget Laptop 14',
        description: 'Reliable performance for daily tasks and online learning. AMD Ryzen 3, 8GB RAM, 256GB SSD.',
        price: 499.99,
        stockQuantity: 80,
        imageUrl: 'http://localhost:5000/uploads/3.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Limited Time Offer']
    },
    {
        name: '2-in-1 Convertible Laptop',
        description: 'Versatile laptop that transforms into a tablet. Ideal for creative professionals and students.',
        price: 899.00,
        stockQuantity: 30,
        imageUrl: 'http://localhost:5000/uploads/4.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/457b9d/f1faee?text=Tablet+Mode',
            'https://placehold.co/400x300/457b9d/f1faee?text=Tent+Mode'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 40) + 8,
        reviews: generateRandomReviews(2),
        offers: ['Includes Stylus Pen']
    },
    {
        name: 'High-End Gaming PC',
        description: 'Custom-built powerhouse for extreme gaming and content creation. Liquid-cooled, RGB case.',
        price: 2499.00,
        stockQuantity: 15,
        imageUrl: 'http://localhost:5000/uploads/5.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/1d3557/a8dadc?text=PC+Interior',
            'https://placehold.co/400x300/1d3557/a8dadc?text=PC+RGB'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 20) + 5,
        reviews: generateRandomReviews(2),
        offers: ['Free Gaming Mouse & Keyboard', 'Professional Assembly']
    },
    {
        name: 'Mini PC Home Office',
        description: 'Compact and energy-efficient mini PC, perfect for home office or media center. Intel NUC equivalent.',
        price: 399.00,
        stockQuantity: 50,
        imageUrl: 'http://localhost:5000/uploads/6.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 35) + 7,
        reviews: generateRandomReviews(1),
        offers: ['Compact Design']
    },
    {
        name: 'All-in-One Desktop 24"',
        description: 'Sleek 24-inch Full HD touchscreen desktop with integrated speakers and webcam. Perfect for families.',
        price: 799.00,
        stockQuantity: 20,
        imageUrl: 'http://localhost:5000/uploads/7.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/a8dadc/1d3557?text=AIO+Side',
            'https://placehold.co/400x300/a8dadc/1d3557?text=AIO+Rear'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 25) + 6,
        reviews: generateRandomReviews(2),
        offers: ['Wireless Keyboard & Mouse Included']
    },
    {
        name: 'Flagship Smartphone X',
        description: 'Capture stunning photos with a 108MP camera, powered by the latest A17 Bionic chip. 5G ready.',
        price: 999.00,
        stockQuantity: 60,
        imageUrl: 'http://localhost:5000/uploads/8.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f1faee/e63946?text=Phone+Back',
            'https://placehold.co/400x300/f1faee/e63946?text=Phone+Camera'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 100) + 30,
        reviews: generateRandomReviews(4),
        offers: ['Free Case & Screen Protector', 'Trade-in Bonus']
    },
    {
        name: 'Mid-Range Android Phone',
        description: 'Great features at an affordable price. Long-lasting battery, vibrant display, and dual cameras.',
        price: 349.00,
        stockQuantity: 120,
        imageUrl: 'http://localhost:5000/uploads/9.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 70) + 20,
        reviews: generateRandomReviews(3),
        offers: ['Limited Stock']
    },
    {
        name: 'Pro Tablet 11-inch',
        description: 'Powerful tablet for creativity and productivity. Liquid Retina display, M2 chip, Apple Pencil support.',
        price: 799.00,
        stockQuantity: 35,
        imageUrl: 'http://localhost:5000/uploads/10.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/457b9d/f1faee?text=Tablet+Side',
            'https://placehold.co/400x300/457b9d/f1faee?text=Tablet+Pen'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 45) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Optional Keyboard Case']
    },
    {
        name: 'Budget Android Tablet',
        description: 'Affordable tablet for entertainment and casual use. Great for kids and media consumption.',
        price: 199.00,
        stockQuantity: 90,
        imageUrl: 'http://localhost:5000/uploads/11.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 55) + 12,
        reviews: generateRandomReviews(1),
        offers: ['Bundle with Kids Case']
    },
    {
        name: 'Smartwatch Series 8',
        description: 'Advanced health features, always-on display, and cellular connectivity. Track your fitness and stay connected.',
        price: 399.00,
        stockQuantity: 70,
        imageUrl: 'http://localhost:5000/uploads/12.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/a8dadc/1d3557?text=Watch+Face',
            'https://placehold.co/400x300/a8dadc/1d3557?text=Watch+Side'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 80) + 25,
        reviews: generateRandomReviews(3),
        offers: ['Free Extra Band']
    },
    {
        name: 'Fitness Tracker Pro',
        description: 'Monitor heart rate, steps, sleep, and more with this sleek fitness band. Long battery life.',
        price: 79.99,
        stockQuantity: 150,
        imageUrl: 'http://localhost:5000/uploads/13.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 90) + 20,
        reviews: generateRandomReviews(2),
        offers: ['Water Resistant']
    },
    {
        name: 'Drone Pro 3',
        description: 'Professional 4K drone with 3-axis gimbal, 30-minute flight time, and obstacle avoidance.',
        price: 1299.00,
        stockQuantity: 10,
        imageUrl: 'http://localhost:5000/uploads/14.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/e63946/f1faee?text=Drone+Flying',
            'https://placehold.co/400x300/e63946/f1faee?text=Drone+Folded'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 15) + 3,
        reviews: generateRandomReviews(1),
        offers: ['Free Extra Battery']
    },
    {
        name: 'Mirrorless Camera Z50',
        description: 'Compact and powerful mirrorless camera with 24MP sensor and 4K video. Perfect for enthusiasts.',
        price: 899.00,
        stockQuantity: 20,
        imageUrl: 'http://localhost:5000/uploads/15.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/a8dadc/1d3557?text=Camera+Lens',
            'https://placehold.co/400x300/a8dadc/1d3557?text=Camera+Back'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 25) + 5,
        reviews: generateRandomReviews(2),
        offers: ['Kit Lens Included']
    },
    {
        name: 'Action Camera 4K',
        description: 'Rugged and waterproof 4K action camera for all your adventures. HyperSmooth stabilization.',
        price: 299.00,
        stockQuantity: 50,
        imageUrl: 'http://localhost:5000/uploads/16.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 40) + 8,
        reviews: generateRandomReviews(1),
        offers: ['Free Mounting Kit']
    },
    {
        name: 'Wi-Fi 6 Mesh System',
        description: 'Whole-home coverage with blazing-fast Wi-Fi 6 speeds. Eliminate dead zones and enjoy seamless streaming.',
        price: 249.00,
        stockQuantity: 40,
        imageUrl: 'http://localhost:5000/uploads/17.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/e63946/f1faee?text=Mesh+Router',
            'https://placehold.co/400x300/e63946/f1faee?text=Mesh+Node'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 5,
        reviews: generateRandomReviews(2),
        offers: ['Easy Setup Guide']
    },
    {
        name: 'Gigabit Ethernet Switch 8-Port',
        description: 'Expand your wired network with this unmanaged 8-port Gigabit Ethernet switch. Plug and play.',
        price: 49.99,
        stockQuantity: 100,
        imageUrl: 'http://localhost:5000/uploads/18.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 60) + 10,
        reviews: generateRandomReviews(1),
        offers: ['Fanless Design']
    },
    {
        name: 'Internal SSD 2TB NVMe',
        description: 'Blazing-fast NVMe SSD for your PC or laptop. Dramatically improve load times and system responsiveness.',
        price: 179.00,
        stockQuantity: 60,
        imageUrl: 'http://localhost:5000/uploads/19.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 50) + 15,
        reviews: generateRandomReviews(2),
        offers: ['5-Year Warranty']
    },
    {
        name: 'Network Attached Storage (NAS) 2-Bay',
        description: 'Your personal cloud storage solution. Centralize your data, stream media, and backup devices.',
        price: 299.00,
        stockQuantity: 20,
        imageUrl: 'http://localhost:5000/uploads/20.jpg',
        additionalImages: [
            'https://placehold.co/400x300/e63946/f1faee?text=NAS+Rear',
            'https://placehold.co/400x300/e63946/f1faee?text=NAS+Disks'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 10) + 2,
        reviews: generateRandomReviews(1),
        offers: ['Diskless Enclosure']
    },
    {
        name: 'Ergonomic Vertical Mouse',
        description: 'Designed to reduce wrist strain, promoting a natural handshake position for comfortable long-term use.',
        price: 45.00,
        stockQuantity: 80,
        imageUrl: 'http://localhost:5000/uploads/21.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f0f2f5/2c3e50?text=Mouse+Hand',
            'https://placehold.co/400x300/f0f2f5/2c3e50?text=Mouse+Angle'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 70) + 15,
        reviews: generateRandomReviews(3),
        offers: ['Adjustable DPI']
    },
    {
        name: 'Gaming Mouse Pad XL',
        description: 'Large surface, optimized for gaming sensors, with anti-slip rubber base for ultimate control.',
        price: 19.99,
        stockQuantity: 250,
        imageUrl: 'http://localhost:5000/uploads/22.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 100) + 20,
        reviews: generateRandomReviews(2),
        offers: ['Stitched Edges']
    },
    {
        name: 'Professional USB Microphone',
        description: 'Studio-quality condenser microphone for streaming, podcasting, and recording. Plug and play.',
        price: 79.00,
        stockQuantity: 60,
        imageUrl: 'http://localhost:5000/uploads/23.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/cce5ff/007bff?text=Mic+Stand',
            'https://placehold.co/400x300/cce5ff/007bff?text=Mic+PopFilter'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 40) + 8,
        reviews: generateRandomReviews(2),
        offers: ['Includes Desktop Stand']
    },
    {
        name: 'Curved Gaming Monitor 32"',
        description: 'Immersive 32-inch 144Hz curved monitor for an unparalleled gaming experience. QHD resolution.',
        price: 499.00,
        stockQuantity: 30,
        imageUrl: 'http://localhost:5000/uploads/24.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/ffeeba/ffc107?text=Monitor+Back',
            'https://placehold.co/400x300/ffeeba/ffc107?text=Monitor+Setup'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 20) + 5,
        reviews: generateRandomReviews(1),
        offers: ['AMD FreeSync Premium']
    },
    {
        name: 'Wireless Ergonomic Keyboard',
        description: 'Split design and cushioned palm rest for maximum typing comfort and reduced strain.',
        price: 69.99,
        stockQuantity: 70,
        imageUrl: 'http://localhost:5000/uploads/25.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 50) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Multi-Device Connectivity']
    },
    {
        name: 'Portable Projector Mini',
        description: 'Pocket-sized projector for movies, presentations, and gaming on the go. Built-in speaker.',
        price: 189.00,
        stockQuantity: 45,
        imageUrl: 'http://localhost:5000/uploads/26.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f8d7da/dc3545?text=Projector+Side',
            'https://placehold.co/400x300/f8d7da/dc3545?text=Projector+Screen'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 5,
        reviews: generateRandomReviews(1),
        offers: ['HDMI & USB Input']
    },
    {
        name: 'Fast Wireless Charging Stand',
        description: 'Charge your smartphone vertically or horizontally with this fast wireless charging stand.',
        price: 34.99,
        stockQuantity: 100,
        imageUrl: 'http://localhost:5000/uploads/27.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 80) + 20,
        reviews: generateRandomReviews(3),
        offers: ['Qi Certified']
    },
    {
        name: 'USB-C to HDMI Adapter 4K',
        description: 'Connect your USB-C laptop or phone to an HDMI display with 4K@60Hz support.',
        price: 18.50,
        stockQuantity: 200,
        imageUrl: 'http://localhost:5000/uploads/28.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 120) + 30,
        reviews: generateRandomReviews(4),
        offers: ['Plug & Play']
    },
    {
        name: 'Portable Power Bank 20000mAh',
        description: 'High-capacity power bank with dual USB-A and USB-C ports for fast charging multiple devices.',
        price: 45.00,
        stockQuantity: 90,
        imageUrl: 'http://localhost:5000/uploads/29.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f8f9fa/333333?text=Power+Bank+Ports',
            'https://placehold.co/400x300/f8f9fa/333333?text=Power+Bank+Size'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 150) + 40,
        reviews: generateRandomReviews(5),
        offers: ['Built-in LED Display']
    },
    {
        name: 'Universal Laptop Charger 90W',
        description: 'Compatible with most laptop brands, includes multiple tips and surge protection.',
        price: 39.99,
        stockQuantity: 75,
        imageUrl: 'http://localhost:5000/uploads/30.png',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 60) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Multi-Tip Design']
    },
    {
        name: 'Smartphone Gimbal Stabilizer',
        description: 'Capture smooth, cinematic footage with your smartphone. 3-axis stabilization and intelligent tracking.',
        price: 99.00,
        stockQuantity: 30,
        imageUrl: 'http://localhost:5000/uploads/31.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/fcf8e3/856404?text=Gimbal+Folded',
            'https://placehold.co/400x300/fcf8e3/856404?text=Gimbal+Action'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 25) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Free Mini Tripod']
    },
    {
        name: 'Magnetic Phone Mount for Car',
        description: 'Securely hold your smartphone on your car dashboard or vent with strong magnets.',
        price: 14.99,
        stockQuantity: 300,
        imageUrl: 'http://localhost:5000/uploads/32.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 200) + 50,
        reviews: generateRandomReviews(4),
        offers: ['360° Rotation']
    },
    {
        name: 'Laptop Privacy Screen Filter 15.6"',
        description: 'Protect your sensitive data from prying eyes with this easy-to-install privacy filter.',
        price: 49.00,
        stockQuantity: 60,
        imageUrl: 'http://localhost:5000/uploads/33.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Anti-Glare Coating']
    },
    {
        name: 'Stylus Pen for Tablets',
        description: 'Precise and responsive stylus for drawing, writing, and navigating on touchscreens.',
        price: 29.00,
        stockQuantity: 120,
        imageUrl: 'http://localhost:5000/uploads/34.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 70) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Palm Rejection']
    },
    {
        name: 'Arduino Uno R3 Board',
        description: 'Popular open-source microcontroller board for electronics projects and learning.',
        price: 22.99,
        stockQuantity: 80,
        imageUrl: 'http://localhost:5000/uploads/35.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/d4edda/28a745?text=Arduino+Top',
            'https://placehold.co/400x300/d4edda/28a745?text=Arduino+Ports'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 90) + 20,
        reviews: generateRandomReviews(3),
        offers: ['Starter Kits Available']
    },
    {
        name: 'Raspberry Pi 4 Model B (4GB)',
        description: 'Versatile single-board computer for DIY projects, home automation, and learning to code.',
        price: 55.00,
        stockQuantity: 50,
        imageUrl: 'http://localhost:5000/uploads/36.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/ffeeba/ffc107?text=Pi+Ports',
            'https://placehold.co/400x300/ffeeba/ffc107?text=Pi+Mounted'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 70) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Official Case Bundle']
    },
    {
        name: 'ESP32 Development Board',
        description: 'Wi-Fi and Bluetooth enabled development board for IoT projects and embedded systems.',
        price: 9.99,
        stockQuantity: 150,
        imageUrl: 'http://localhost:5000/uploads/37.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 100) + 25,
        reviews: generateRandomReviews(3),
        offers: ['Bulk Discount']
    },
    {
        name: 'Breadboard 830 Tie-Points',
        description: 'Solderless breadboard for prototyping electronic circuits. Ideal for beginners and hobbyists.',
        price: 5.00,
        stockQuantity: 500,
        imageUrl: 'http://localhost:5000/uploads/38.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 150) + 40,
        reviews: generateRandomReviews(4),
        offers: ['Multi-Pack Available']
    },
    {
        name: 'Jumper Wires Assortment (400pcs)',
        description: 'Male-to-male, male-to-female, and female-to-female jumper wires for breadboards and prototyping.',
        price: 11.50,
        stockQuantity: 200,
        imageUrl: 'http://localhost:5000/uploads/39.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 100) + 20,
        reviews: generateRandomReviews(2),
        offers: ['Various Colors']
    },
    {
        name: 'Smart Plug Mini',
        description: 'Control your appliances from anywhere with this Wi-Fi smart plug. Schedule on/off times.',
        price: 19.99,
        stockQuantity: 180,
        imageUrl: 'http://localhost:5000/uploads/40.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 110) + 30,
        reviews: generateRandomReviews(3),
        offers: ['Voice Control Compatible']
    },
    {
        name: 'Robot Vacuum Cleaner',
        description: 'Intelligent robot vacuum with powerful suction, smart navigation, and app control.',
        price: 299.00,
        stockQuantity: 25,
        imageUrl: 'http://localhost:5000/uploads/41.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/fcf8e3/856404?text=Vacuum+Bottom',
            'https://placehold.co/400x300/fcf8e3/856404?text=Vacuum+Dock'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 35) + 7,
        reviews: generateRandomReviews(2),
        offers: ['Auto-Docking & Recharge']
    },
    {
        name: 'Portable SSD 500GB USB 3.2',
        description: 'Ultra-fast and compact external SSD for reliable data storage and transfer on the go.',
        price: 79.99,
        stockQuantity: 100,
        imageUrl: 'http://localhost:5000/uploads/42.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 90) + 20,
        reviews: generateRandomReviews(3),
        offers: ['Pocket-Sized']
    },
    {
        name: 'Gaming Headset with Mic',
        description: 'Immersive 7.1 surround sound gaming headset with noise-cancelling microphone for clear communication.',
        price: 65.00,
        stockQuantity: 120,
        imageUrl: 'http://localhost:5000/uploads/43.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/a8dadc/1d3557?text=Headset+Mic',
            'https://placehold.co/400x300/a8dadc/1d3557?text=Headset+Side'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 110) + 25,
        reviews: generateRandomReviews(4),
        offers: ['RGB Lighting']
    },
    {
        name: 'Wireless Earbuds Pro',
        description: 'Premium true wireless earbuds with active noise cancellation, transparency mode, and rich audio.',
        price: 159.00,
        stockQuantity: 80,
        imageUrl: 'http://localhost:5000/uploads/44.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f1faee/e63946?text=Earbuds+Case',
            'https://placehold.co/400x300/f1faee/e63946?text=Earbuds+InEar'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 130) + 35,
        reviews: generateRandomReviews(5),
        offers: ['30-Hour Battery Life']
    },
    {
        name: 'Smart Home Security Camera',
        description: 'Full HD indoor security camera with motion detection, night vision, and two-way audio.',
        price: 59.99,
        stockQuantity: 90,
        imageUrl: 'http://localhost:5000/uploads/45.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 70) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Cloud Storage Available']
    },
    {
        name: 'Portable Photo Printer',
        description: 'Print instant photos from your smartphone. ZINK Zero Ink technology for vibrant, smudge-proof prints.',
        price: 119.00,
        stockQuantity: 40,
        imageUrl: 'http://localhost:5000/uploads/46.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/e63946/f1faee?text=Printer+Side',
            'https://placehold.co/400x300/e63946/f1faee?text=Printer+Print'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 20) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Includes 10 Sheets of Photo Paper']
    },
    {
        name: 'Digital Drawing Tablet 10"',
        description: 'Large drawing area with pressure-sensitive stylus. Ideal for digital art, graphic design, and online teaching.',
        price: 89.00,
        stockQuantity: 55,
        imageUrl: 'http://localhost:5000/uploads/47.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 45) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Compatible with Mac & PC']
    },
    {
        name: 'Smart Doorbell Camera',
        description: 'See, hear, and speak to visitors from anywhere. Full HD video, motion alerts, and night vision.',
        price: 149.00,
        stockQuantity: 30,
        imageUrl: 'http://localhost:5000/uploads/48.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f1faee/457b9d?text=Doorbell+Installed',
            'https://placehold.co/400x300/f1faee/457b9d?text=Doorbell+App'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Easy Installation']
    },
    {
        name: 'USB-C Multiport Adapter Pro',
        description: 'All-in-one hub with HDMI, Ethernet, USB 3.0, SD/TF card readers, and 100W PD charging.',
        price: 59.99,
        stockQuantity: 110,
        imageUrl: 'http://localhost:5000/uploads/49.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 80) + 20,
        reviews: generateRandomReviews(3),
        offers: ['Aluminum Casing']
    },
    {
        name: 'Gaming Chair Ergonomic',
        description: 'High-back ergonomic gaming chair with lumbar support, adjustable armrests, and recline function.',
        price: 199.00,
        stockQuantity: 20,
        imageUrl: 'http://localhost:5000/uploads/50.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/a8dadc/1d3557?text=Chair+Recline',
            'https://placehold.co/400x300/a8dadc/1d3557?text=Chair+Side'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 25) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Free Shipping']
    },
    {
        name: 'Smart Light Strip RGB',
        description: 'Flexible RGB LED light strip with app control and music sync. Perfect for ambient lighting.',
        price: 35.00,
        stockQuantity: 150,
        imageUrl: 'http://localhost:5000/uploads/51.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 60) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Voice Assistant Compatible']
    },
    {
        name: 'Portable Monitor 15.6"',
        description: 'Extend your workspace with this lightweight 15.6" Full HD portable monitor. Powered by USB-C.',
        price: 179.99,
        stockQuantity: 50,
        imageUrl: 'http://localhost:5000/uploads/52.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/d4edda/28a745?text=Monitor+Side',
            'https://placehold.co/400x300/d4edda/28a745?text=Monitor+Setup'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 35) + 8,
        reviews: generateRandomReviews(2),
        offers: ['Includes Smart Cover']
    },
     {
        name: 'Gaming Desk Large',
        description: 'Spacious and sturdy gaming desk with cable management system and built-in cup holder. Carbon fiber texture surface.',
        price: 249.99,
        stockQuantity: 40,
        imageUrl: 'http://localhost:5000/uploads/53.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/a8dadc/1d3557?text=Desk+Setup',
            'https://placehold.co/400x300/a8dadc/1d3557?text=Desk+Cable+Management'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Free Shipping', 'Easy Assembly']
    },
    {
        name: 'Smart Scale Body Composition',
        description: 'Track weight, BMI, body fat, muscle mass, and more with this smart scale. Syncs with your smartphone via Bluetooth.',
        price: 39.99,
        stockQuantity: 100,
        imageUrl: 'http://localhost:5000/uploads/54.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 80) + 20,
        reviews: generateRandomReviews(3),
        offers: ['Family-Friendly Profiles']
    },
    {
        name: 'External Hard Drive 4TB',
        description: 'High-capacity 4TB external hard drive for reliable backup and storage of photos, videos, and documents. USB 3.0 compatible.',
        price: 109.00,
        stockQuantity: 75,
        imageUrl: 'http://localhost:5000/uploads/55.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 60) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Includes USB 3.0 Cable']
    },
    {
        name: 'USB Condenser Microphone Kit',
        description: 'Complete kit for podcasting, streaming, and voiceovers. Includes microphone, shock mount, pop filter, and desktop stand.',
        price: 79.99,
        stockQuantity: 50,
        imageUrl: 'http://localhost:5000/uploads/56.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/cce5ff/007bff?text=Mic+Setup',
            'https://placehold.co/400x300/cce5ff/007bff?text=Mic+Parts'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 40) + 10,
        reviews: generateRandomReviews(3),
        offers: ['Easy Plug & Play']
    },
    {
        name: 'Smart Light Bulbs 4-Pack',
        description: 'Control your lighting with your voice or smartphone. Dimmable, color-changing bulbs with scheduling features.',
        price: 49.99,
        stockQuantity: 200,
        imageUrl: 'http://localhost:5000/uploads/57.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 120) + 40,
        reviews: generateRandomReviews(4),
        offers: ['Works with Alexa & Google Assistant']
    },
    {
        name: 'Wireless Charging Desk Mat',
        description: 'Large desk mat with an integrated 15W wireless charging pad. Provides a smooth surface for your mouse and keyboard.',
        price: 59.99,
        stockQuantity: 65,
        imageUrl: 'http://localhost:5000/uploads/58.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f0f2f5/2c3e50?text=Mat+Charging',
            'https://placehold.co/400x300/f0f2f5/2c3e50?text=Mat+Layout'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 35) + 8,
        reviews: generateRandomReviews(2),
        offers: ['Multi-Purpose Design']
    },
    {
        name: 'USB-C to Lightning Cable (MFi)',
        description: 'Durable, MFi-certified USB-C to Lightning cable for fast charging and syncing Apple devices.',
        price: 19.99,
        stockQuantity: 250,
        imageUrl: 'http://localhost:5000/uploads/59.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 150) + 50,
        reviews: generateRandomReviews(5),
        offers: ['Braided Nylon Exterior']
    },
    {
        name: 'Smart Thermostat Wi-Fi',
        description: 'Save energy and money with a smart thermostat that learns your habits and can be controlled remotely.',
        price: 129.00,
        stockQuantity: 30,
        imageUrl: 'http://localhost:5000/uploads/60.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/d4edda/28a745?text=Thermostat+App',
            'https://placehold.co/400x300/d4edda/28a745?text=Thermostat+Wall'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 20) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Professional Installation Available']
    },
    {
        name: 'Portable Monitor 13.3" 4K',
        description: 'Ultra-high-resolution 13.3" 4K portable monitor for stunning visuals on the go. USB-C and mini-HDMI connectivity.',
        price: 299.00,
        stockQuantity: 25,
        imageUrl: 'http://localhost:5000/uploads/61.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 15) + 3,
        reviews: generateRandomReviews(1),
        offers: ['Built-in Speakers']
    },
    {
        name: 'Gaming Headphone Stand with RGB',
        description: 'Display your gaming headset in style with this stand featuring customizable RGB lighting and a stable base.',
        price: 29.99,
        stockQuantity: 85,
        imageUrl: 'http://localhost:5000/uploads/62.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 50) + 12,
        reviews: generateRandomReviews(2),
        offers: ['Multiple Lighting Modes']
    },
    {
        name: 'USB-C to Ethernet Adapter',
        description: 'Connect your USB-C device to a wired Gigabit Ethernet network for a stable and fast internet connection.',
        price: 17.99,
        stockQuantity: 150,
        imageUrl: 'http://localhost:5000/uploads/63.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 90) + 20,
        reviews: generateRandomReviews(3),
        offers: ['LED Status Indicator']
    },
    {
        name: 'Smart Sprinkler Controller',
        description: 'Manage your garden watering system from your phone. Create schedules, monitor water usage, and save water.',
        price: 119.00,
        stockQuantity: 20,
        imageUrl: 'http://localhost:5000/uploads/64.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 10) + 2,
        reviews: generateRandomReviews(1),
        offers: ['Weather-Based Watering']
    },
    {
        name: 'Portable Bluetooth Keyboard',
        description: 'Slim and lightweight keyboard that connects wirelessly to your smartphone, tablet, or laptop.',
        price: 35.00,
        stockQuantity: 110,
        imageUrl: 'http://localhost:5000/uploads/65.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/e63946/f1faee?text=Keyboard+Phone',
            'https://placehold.co/400x300/e63946/f1faee?text=Keyboard+Tablet'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 70) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Long Battery Life']
    },
    {
        name: 'USB 3.0 Hub 4-Port',
        description: 'Expand your connectivity with this compact 4-port USB 3.0 hub. Data transfer speeds up to 5Gbps.',
        price: 14.99,
        stockQuantity: 180,
        imageUrl: 'http://localhost:5000/uploads/66.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 100) + 25,
        reviews: generateRandomReviews(3),
        offers: ['Powered or Unpowered Use']
    },
    {
        name: 'Smart Lock Keyless Entry',
        description: 'Secure your home with a smart lock. Keyless entry, remote access, and guest code management via an app.',
        price: 199.00,
        stockQuantity: 25,
        imageUrl: 'http://localhost:5000/uploads/67.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/a8dadc/1d3557?text=Lock+Installed',
            'https://placehold.co/400x300/a8dadc/1d3557?text=Lock+App'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 20) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Works with Wi-Fi']
    },
    {
        name: 'Gaming Monitor 24" 144Hz',
        description: 'Fast and responsive 24-inch Full HD gaming monitor with a 144Hz refresh rate and 1ms response time.',
        price: 219.00,
        stockQuantity: 50,
        imageUrl: 'http://localhost:5000/uploads/68.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/ffeeba/ffc107?text=Monitor+Side',
            'https://placehold.co/400x300/ffeeba/ffc107?text=Monitor+Back'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 40) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Adjustable Stand']
    },
    {
        name: 'Laptop Cooling Pad 17"',
        description: 'Keep your laptop cool during intense use with this cooling pad featuring multiple adjustable fans and RGB lighting.',
        price: 34.99,
        stockQuantity: 90,
        imageUrl: 'http://localhost:5000/uploads/69.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 50) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Fits up to 17-inch Laptops']
    },
    {
        name: 'USB-C to DisplayPort Cable 4K',
        description: 'Connect your USB-C device to a DisplayPort monitor for a crystal-clear 4K@60Hz video experience.',
        price: 22.50,
        stockQuantity: 120,
        imageUrl: 'http://localhost:5000/uploads/70.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 70) + 18,
        reviews: generateRandomReviews(3),
        offers: ['Plug & Play']
    },
    {
        name: 'Smart Air Purifier HEPA',
        description: 'Improve your air quality with a smart air purifier featuring a HEPA filter, app control, and air quality monitoring.',
        price: 159.00,
        stockQuantity: 35,
        imageUrl: 'http://localhost:5000/uploads/71.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/457b9d/f1faee?text=Purifier+Filter',
            'https://placehold.co/400x300/457b9d/f1faee?text=Purifier+App'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 25) + 6,
        reviews: generateRandomReviews(1),
        offers: ['Automatic Mode']
    },
    {
        name: 'Portable Photo Studio Box',
        description: 'Create professional-quality photos of small products with this portable light box. Includes LED lighting and different backdrops.',
        price: 49.00,
        stockQuantity: 60,
        imageUrl: 'http://localhost:5000/uploads/72.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 5,
        reviews: generateRandomReviews(2),
        offers: ['Foldable Design']
    },
    {
        name: 'Smart LED Strip Lights 5M',
        description: '5-meter smart LED light strip for decorating rooms, TVs, and more. Customize colors and effects via an app.',
        price: 29.99,
        stockQuantity: 150,
        imageUrl: 'http://localhost:5000/uploads/73.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 100) + 25,
        reviews: generateRandomReviews(3),
        offers: ['Music Sync Mode']
    },
    {
        name: 'Universal Tablet Stand',
        description: 'Adjustable stand for tablets, e-readers, and phones. Perfect for hands-free viewing, reading, and video calls.',
        price: 15.99,
        stockQuantity: 200,
        imageUrl: 'http://localhost:5000/uploads/74.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 120) + 30,
        reviews: generateRandomReviews(4),
        offers: ['Foldable for Portability']
    },
    {
        name: 'USB-C to USB-A Adapter (2-pack)',
        description: 'Convert your USB-C port to a USB-A port. Perfect for connecting older devices and peripherals to modern laptops.',
        price: 9.99,
        stockQuantity: 300,
        imageUrl: 'http://localhost:5000/uploads/75.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 150) + 50,
        reviews: generateRandomReviews(5),
        offers: ['Aluminum Housing']
    },
    {
        name: 'Smart Home Hub Zigbee/Z-Wave',
        description: 'Central hub to connect and control all your smart home devices from one app. Supports Zigbee and Z-Wave protocols.',
        price: 79.99,
        stockQuantity: 20,
        imageUrl: 'http://localhost:5000/uploads/76.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 15) + 3,
        reviews: generateRandomReviews(1),
        offers: ['Local Control']
    },
    {
        name: 'Gaming Mouse Wired RGB',
        description: 'Ergonomic wired gaming mouse with a high-precision sensor, customizable RGB lighting, and programmable buttons.',
        price: 39.99,
        stockQuantity: 80,
        imageUrl: 'http://localhost:5000/uploads/77.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/1d3557/a8dadc?text=Mouse+RGB',
            'https://placehold.co/400x300/1d3557/a8dadc?text=Mouse+Side'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 60) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Adjustable DPI']
    },
    {
        name: 'Portable SSD 1TB USB 3.2',
        description: 'Fast and reliable 1TB portable SSD for your data storage needs. Perfect for quick file transfers on the go.',
        price: 99.00,
        stockQuantity: 70,
        imageUrl: 'http://localhost:5000/uploads/78.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 50) + 12,
        reviews: generateRandomReviews(2),
        offers: ['Shock Resistant']
    },
    {
        name: 'Bluetooth Speaker Waterproof',
        description: 'Take your music anywhere with this rugged, waterproof Bluetooth speaker. Long-lasting battery and clear sound.',
        price: 49.99,
        stockQuantity: 110,
        imageUrl: 'http://localhost:5000/uploads/79.jpg',
        additionalImages: [
            'https://placehold.co/400x300/e63946/f1faee?text=Speaker+Water',
            'https://placehold.co/400x300/e63946/f1faee?text=Speaker+Side'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 90) + 20,
        reviews: generateRandomReviews(3),
        offers: ['Built-in Mic']
    },
    {
        name: 'Smartwatch Sport Edition',
        description: 'Fitness-focused smartwatch with GPS, heart rate monitoring, and long battery life. Perfect for workouts and daily tracking.',
        price: 129.00,
        stockQuantity: 60,
        imageUrl: 'http://localhost:5000/uploads/80.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/a8dadc/1d3557?text=Watch+Workout',
            'https://placehold.co/400x300/a8dadc/1d3557?text=Watch+Face'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 70) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Multiple Sport Modes']
    },
    {
        name: 'USB-C Docking Station Dual Monitor',
        description: 'Expand your laptop’s capabilities with this docking station. Supports dual monitors, USB ports, and Ethernet.',
        price: 149.00,
        stockQuantity: 30,
        imageUrl: 'http://localhost:5000/uploads/81.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/457b9d/f1faee?text=Dock+Setup',
            'https://placehold.co/400x300/457b9d/f1faee?text=Dock+Ports'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 25) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Power Delivery']
    },
    {
        name: 'Wireless Gaming Headset',
        description: 'Lag-free wireless gaming headset with 7.1 surround sound, comfortable ear cups, and a noise-cancelling microphone.',
        price: 99.00,
        stockQuantity: 55,
        imageUrl: 'http://localhost:5000/uploads/82.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/fcf8e3/856404?text=Headset+Side',
            'https://placehold.co/400x300/fcf8e3/856404?text=Headset+Mic'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 50) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Multi-Platform Compatibility']
    },
    {
        name: 'Portable Mini Projector',
        description: 'A pocket-sized projector perfect for presentations, movies, and gaming on the go. Built-in battery and speaker.',
        price: 159.00,
        stockQuantity: 45,
        imageUrl: 'http://localhost:5000/uploads/83.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 5,
        reviews: generateRandomReviews(1),
        offers: ['HDMI & USB Input']
    },
    {
        name: 'Smart Home Security System',
        description: 'Comprehensive DIY home security system with motion sensors, door/window sensors, and a central hub.',
        price: 249.00,
        stockQuantity: 20,
        imageUrl: 'http://localhost:5000/uploads/84.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/d4edda/28a745?text=System+Hub',
            'https://placehold.co/400x300/d4edda/28a745?text=System+Sensor'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 15) + 3,
        reviews: generateRandomReviews(1),
        offers: ['No Monthly Fees']
    },
    {
        name: 'Gaming Keyboard Compact 60%',
        description: 'A compact 60% mechanical gaming keyboard with customizable RGB backlighting and durable keycaps. Saves desk space.',
        price: 89.00,
        stockQuantity: 70,
        imageUrl: 'http://localhost:5000/uploads/85.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 40) + 8,
        reviews: generateRandomReviews(2),
        offers: ['Hot-Swappable Switches']
    },
    {
        name: 'USB-C to SD Card Reader',
        description: 'Easily transfer photos and videos from your camera to your USB-C enabled laptop or tablet. Supports UHS-I speeds.',
        price: 12.99,
        stockQuantity: 150,
        imageUrl: 'http://localhost:5000/uploads/86.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 90) + 20,
        reviews: generateRandomReviews(3),
        offers: ['Compact Design']
    },
    {
        name: 'Smart Home Motion Sensor',
        description: 'Trigger automations and receive alerts when motion is detected. Easy to install and integrates with smart home hubs.',
        price: 25.00,
        stockQuantity: 120,
        imageUrl: 'http://localhost:5000/uploads/87.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 60) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Long Battery Life']
    },
    {
        name: 'VR Headset Stand',
        description: 'Keep your VR headset and controllers organized and displayed with this sleek and stable stand.',
        price: 29.99,
        stockQuantity: 50,
        imageUrl: 'http://localhost:5000/uploads/88.jpg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 20) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Non-Slip Base']
    },
    {
        name: 'Gaming Mouse Wireless Lightweight',
        description: 'Feather-light wireless gaming mouse with a high-speed sensor, long battery life, and comfortable ergonomic shape.',
        price: 69.00,
        stockQuantity: 65,
        imageUrl: 'http://localhost:5000/uploads/89.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f8f9fa/333333?text=Mouse+Side',
            'https://placehold.co/400x300/f8f9fa/333333?text=Mouse+RGB'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 45) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Includes USB-C Charging Cable']
    },
    {
        name: 'Portable SSD 2TB USB 3.2',
        description: 'Massive 2TB of fast, portable storage. Ideal for creative professionals and gamers on the move.',
        price: 169.00,
        stockQuantity: 50,
        imageUrl: 'http://localhost:5000/uploads/90.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 35) + 8,
        reviews: generateRandomReviews(2),
        offers: ['Compact & Durable']
    },
    {
        name: 'Smart Display with Voice Assistant',
        description: 'A hub for your smart home with a touch screen, speaker, and voice assistant. View calendars, photos, and control devices.',
        price: 99.00,
        stockQuantity: 40,
        imageUrl: 'http://localhost:5000/uploads/91.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/fcf8e3/856404?text=Display+Home',
            'https://placehold.co/400x300/fcf8e3/856404?text=Display+Video'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 7,
        reviews: generateRandomReviews(1),
        offers: ['Built-in Camera for Video Calls']
    },
    {
        name: 'USB-C to HDMI/USB/PD Hub',
        description: '3-in-1 USB-C hub with HDMI, USB 3.0, and a USB-C Power Delivery port. Essential for modern laptops.',
        price: 29.99,
        stockQuantity: 180,
        imageUrl: 'http://localhost:5000/uploads/92.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 100) + 25,
        reviews: generateRandomReviews(3),
        offers: ['Aluminum Case']
    },
    {
        name: 'Gaming Headset Stand with USB Hub',
        description: 'Keep your headset and other peripherals organized. Features a stable stand and a 3-port USB hub for convenience.',
        price: 39.99,
        stockQuantity: 60,
        imageUrl: 'http://localhost:5000/uploads/93.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/cce5ff/007bff?text=Stand+USB',
            'https://placehold.co/400x300/cce5ff/007bff?text=Stand+Setup'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 8,
        reviews: generateRandomReviews(2),
        offers: ['Sleek Design']
    },
    {
        name: 'Smart Home Door/Window Sensor',
        description: 'Get notifications when a door or window is opened or closed. Easy to install and integrates with smart home systems.',
        price: 19.99,
        stockQuantity: 150,
        imageUrl: 'http://localhost:5000/uploads/94.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 80) + 20,
        reviews: generateRandomReviews(3),
        offers: ['Compact Size']
    },
    {
        name: 'Portable Hard Drive 1TB',
        description: 'Reliable and affordable 1TB portable hard drive for extra storage on your computer. Simple plug-and-play operation.',
        price: 65.00,
        stockQuantity: 100,
        imageUrl: 'http://localhost:5000/uploads/95.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 70) + 15,
        reviews: generateRandomReviews(2),
        offers: ['Password Protection']
    },
    {
        name: 'Smart Power Strip Wi-Fi',
        description: 'Control multiple outlets individually from your phone. Features surge protection and USB charging ports.',
        price: 39.99,
        stockQuantity: 80,
        imageUrl: 'http://localhost:5000/uploads/96.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/f8d7da/dc3545?text=Power+Strip+Outlets',
            'https://placehold.co/400x300/f8d7da/dc3545?text=Power+Strip+App'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 45) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Works with Alexa & Google']
    },
    {
        name: 'Gaming Headset Stand RGB with Wireless Charging',
        description: 'An all-in-one accessory for your desk. Features a headphone stand, customizable RGB lighting, and a fast wireless charging pad.',
        price: 69.00,
        stockQuantity: 35,
        imageUrl: 'http://localhost:5000/uploads/97.jpeg',
        additionalImages: [
            'https://placehold.co/400x300/ffeeba/ffc107?text=Stand+Charging',
            'https://placehold.co/400x300/ffeeba/ffc107?text=Stand+RGB'
        ],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 20) + 5,
        reviews: generateRandomReviews(1),
        offers: ['Qi Charging Certified']
    },
    {
        name: 'USB-C to Dual HDMI Adapter',
        description: 'Connect two HDMI monitors to your USB-C laptop simultaneously for an extended desktop experience. Supports up to 4K.',
        price: 49.99,
        stockQuantity: 70,
        imageUrl: 'http://localhost:5000/uploads/98.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 30) + 7,
        reviews: generateRandomReviews(2),
        offers: ['Multi-Stream Transport (MST) Compatible']
    },
    {
        name: 'Smart Home Water Leak Sensor',
        description: 'Receive instant alerts on your phone when a water leak is detected. Battery-powered and easy to place anywhere.',
        price: 29.99,
        stockQuantity: 100,
        imageUrl: 'http://localhost:5000/uploads/99.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 40) + 10,
        reviews: generateRandomReviews(2),
        offers: ['Loud Audible Alarm']
    },
    {
        name: 'Portable Bluetooth Speaker Mini',
        description: 'Compact and powerful mini Bluetooth speaker. Perfect for travel or a small room. Surprisingly rich bass.',
        price: 25.00,
        stockQuantity: 200,
        imageUrl: 'http://localhost:5000/uploads/100.jpeg',
        additionalImages: [],
        averageRating: generateRandomRating(),
        numReviews: Math.floor(Math.random() * 110) + 30,
        reviews: generateRandomReviews(4),
        offers: ['Clip-On Design']
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
