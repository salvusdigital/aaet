const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    sort_order: {
        type: Number,
        default: 0
    }
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