const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        room: {
            type: Number,
            required: true,
            min: 0
        },
        restaurant: {
            type: Number,
            required: true,
            min: 0
        }
    },
    category: {
        type: String,
        required: true,
        enum: ['specials', 'foods', 'drinks']
    },
    tags: [{
        type: String,
        enum: ['Spicy', 'Vegetarian', "Chef's Special", 'New', 'Popular', 'Healthy', 'Classic', 'Dessert']
    }],
    image: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema); 