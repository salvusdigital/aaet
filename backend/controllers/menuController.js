const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');

// Get all menu items
const getAllItems = asyncHandler(async (req, res) => {
    // #swagger.tags = ['Menu']
    try {
        const { category } = req.query;

        let query = { available: true };

        // If category is provided, filter by category
        if (category) {
            const categoryDoc = await Category.findOne({ name: category });
            if (categoryDoc) {
                query.category_id = categoryDoc._id;
            }
        }

        const items = await MenuItem.find(query)
            .populate('category_id', 'name description')
            .sort({ name: 1 });

        res.json(items);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
});

// Get menu items by category ID
const getItemsByCategory = asyncHandler(async (req, res) => {
    // #swagger.tags = ['Menu']
    try {
        const { categoryId } = req.params;

        const items = await MenuItem.find({
            category_id: categoryId,
            available: true
        }).populate('category_id', 'name description');

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get each menu item by id
const getItemById = asyncHandler(async (req, res) => {
    // #swagger.tags = ['Menu']
    try {
        const { id } = req.params;
        const item = await MenuItem.findById(id)
            .populate('category_id', 'name description');

        if (!item) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
    // #swagger.tags = ['Menu']
    try {
        const categories = await Category.find({}).sort({ sort_order: 'asc' });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = {
    getAllItems,
    getItemsByCategory,
    getItemById,
    getAllCategories
};