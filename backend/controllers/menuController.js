const MenuItem = require('../models/MenuItem');
const asyncHandler = require('express-async-handler');

// Get all menu items
const getAllItems = asyncHandler(async (req, res) => {
    console.log('getAllContacts endpoint reached');
    const items = await MenuItem.find();
    res.json(items);
});

// Get menu items by service type
const getItemsByService = asyncHandler(async (req, res) => {
    const { service } = req.params;
    const items = await MenuItem.find({ service, isActive: true });
    res.json(items);
});

// Get each menu item by id
const getItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    res.json(item);
});

// Get menu items by category
const getItemsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const items = await MenuItem.find({ category, isActive: true });
    res.json(items);
});


module.exports = {
    getAllItems,
    getItemsByService,
    getItemById,
    getItemsByCategory,
};