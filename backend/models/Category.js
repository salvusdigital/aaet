const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to update the updatedAt field
categorySchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Static method to get active categories
categorySchema.statics.getActiveCategories = function () {
    return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

// Instance method to toggle active status
categorySchema.methods.toggleActive = function () {
    this.isActive = !this.isActive;
    return this.save();
};

module.exports = mongoose.model('Category', categorySchema); 