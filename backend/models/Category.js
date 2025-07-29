const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    group: {
        type: String,
        required: true,
        enum: ['FOOD', 'DRINKS'],
        default: 'FOOD'
    },
    sort_order: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true
});

// Indexes
categorySchema.index({ sort_order: 1 });
categorySchema.index({ name: 'text' });
categorySchema.index({ group: 1, sort_order: 1 });

// Static method to get sorted categories
categorySchema.statics.getMenuStructure = async function () {
    return this.aggregate([
        {
            $sort: { group: 1, sort_order: 1 }
        },
        {
            $group: {
                _id: "$group",
                categories: {
                    $push: {
                        name: "$name",
                        sort_order: "$sort_order"
                    }
                }
            }
        },
        {
            $project: {
                group: "$_id",
                categories: {
                    $sortArray: {
                        input: "$categories",
                        sortBy: { sort_order: 1 }
                    }
                },
                _id: 0
            }
        }
    ]);
};

module.exports = mongoose.model('Category', categorySchema);