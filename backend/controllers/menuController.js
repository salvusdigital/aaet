const MenuItem = require('../models/MenuItem');
const asyncHandler = require('express-async-handler');

// Get all menu items
const getAllItems = asyncHandler(async (req, res) => {
    console.log('getAllContacts endpoint reached');
    const items = await MenuItem.find();
    res.json(items);
});

// Get menu items by category
const getItemsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const items = await MenuItem.find({ category, isActive: true });
    res.json(items);
});

// Create a new menu item
const createItem = async (req, res) => {
    try {
        const menuItem = new MenuItem(req.body);
        const newItem = await menuItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a menu item
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await MenuItem.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a menu item (soft delete)
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await MenuItem.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
        if (!deletedItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getAllItems,
    getItemsByCategory,
    createItem,
    updateItem,
    deleteItem
};