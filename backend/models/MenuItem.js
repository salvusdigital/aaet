const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuItemSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price_room: {
        type: Number,
        required: true,
        min: 0
    },
    price_restaurant: {
        type: Number,
        required: true,
        min: 0
    },
    available: {
        type: Boolean,
        default: true
    },
    image_url: {
        type: String,
        default: null
    },
    tags: [{
        type: String,
        enum: ['Spicy', 'Vegetarian', "Chef's Special", 'New', 'Popular', 'Healthy', 'Classic', 'Dessert']
    }]
}, {
    timestamps: true // This adds createdAt and updatedAt fields automatically
});

// Create indexes for common queries
menuItemSchema.index({ category_id: 1 });
menuItemSchema.index({ available: 1 });
menuItemSchema.index({ name: 'text', description: 'text' }); // Text search index

module.exports = mongoose.model('MenuItem', menuItemSchema); 