const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    group: {
        type: String,
        required: true,
        enum: ['Food', 'Drinks'], // Only allow these two groups
        default: 'Food'
    },
    displayName: { type: String, required: true },
    sort_order: { type: Number, required: true }
}, {
    timestamps: true // This adds createdAt and updatedAt fields automatically
});

// Create indexes for common queries
categorySchema.index({ sort_order: 1 });
categorySchema.index({ name: 'text' });

// Static method to get sorted categories
categorySchema.statics.getSortedCategories = function () {
    return this.find().sort({ sort_order: 1, name: 1 });
};

module.exports = mongoose.model('Category', categorySchema); 