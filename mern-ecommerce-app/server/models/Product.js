const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0 },
    imageUrl: { type: String }, // Main product image URL
    additionalImages: [{ type: String }], // Array of additional image URLs
    averageRating: { type: Number, default: 0, min: 0, max: 5 }, // Average rating of the product
    numReviews: { type: Number, default: 0, min: 0 }, // Total number of reviews
    reviews: [ // Array of review objects
        {
            customerName: { type: String, required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String },
            date: { type: Date, default: Date.now }
        }
    ],
    offers: [{ type: String }], // Array of strings for special offers/promotions
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update the 'updatedAt' field on save
ProductSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', ProductSchema);
