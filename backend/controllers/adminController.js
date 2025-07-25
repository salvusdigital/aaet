const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const MenuItem = require('../models/MenuItem');
const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// Helper function to generate JWT token
const generateToken = (admin) => {
    return jwt.sign(
        { id: admin._id, username: admin.username, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const login = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        const { username, password } = req.body;

        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate token
        const token = generateToken(admin);

        res.json({
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        const { username, newPassword } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// const getAllAdmins = async (req, res) => {

// Menu Management Functions
const createMenuItem = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        // Transform the request body to match the new schema
        const menuItemData = {
            name: req.body.name,
            description: req.body.description,
            category_id: req.body.category_id,
            price_room: req.body.price_room || req.body.price?.room,
            price_restaurant: req.body.price_restaurant || req.body.price?.restaurant,
            available: req.body.available !== undefined ? req.body.available : true,
            image_url: req.body.image_url || req.body.image,
            tags: req.body.tags || []
        };

        const menuItem = new MenuItem(menuItemData);
        await menuItem.save();

        // Populate category information for the response
        const populatedItem = await MenuItem.findById(menuItem._id)
            .populate('category_id', 'name description');

        res.status(201).json(populatedItem);
    } catch (error) {
        res.status(400).json({ message: 'Error creating menu item', error: error.message });
    }
};

const updateMenuItem = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        const { id } = req.params;

        // Transform the request body to match the new schema
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.category_id) updateData.category_id = req.body.category_id;
        if (req.body.price_room || req.body.price?.room) updateData.price_room = req.body.price_room || req.body.price.room;
        if (req.body.price_restaurant || req.body.price?.restaurant) updateData.price_restaurant = req.body.price_restaurant || req.body.price.restaurant;
        if (req.body.available !== undefined) updateData.available = req.body.available;
        if (req.body.image_url || req.body.image) updateData.image_url = req.body.image_url || req.body.image;
        if (req.body.tags) updateData.tags = req.body.tags;

        const menuItem = await MenuItem.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category_id', 'name description');

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json(menuItem);
    } catch (error) {
        res.status(400).json({ message: 'Error updating menu item', error: error.message });
    }
};

const deleteMenuItem = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findByIdAndDelete(id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting menu item', error: error.message });
    }
};

const getMenuItems = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        const { category, available } = req.query;

        // Build query based on filters
        const query = {};

        if (category) {
            const categoryDoc = await Category.findOne({ name: category });
            if (categoryDoc) {
                query.category_id = categoryDoc._id;
            }
        }

        if (available !== undefined) {
            query.available = available === 'true';
        }

        const menuItems = await MenuItem.find(query)
            .populate('category_id', 'name description')
            .sort({ name: 1 });

        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
};


const getCategories = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        const categories = await Category.getSortedCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

const createCategory = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        const { name, sort_order } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            // #swagger.tags = ['Admin']    return res.status(400).json({ message: 'Category already exists' });
        }

        const category = new Category({
            name,
            sort_order: sort_order || 0
        });

        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error creating category', error: error.message });
    }
};

const updateCategory = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        const { id } = req.params;
        const { name, sort_order } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (sort_order !== undefined) updateData.sort_order = sort_order;

        const category = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error updating category', error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    // #swagger.tags = ['Admin']
    try {
        const { id } = req.params;

        // Check if category is in use
        const menuItemsUsingCategory = await MenuItem.countDocuments({ category_id: id });
        if (menuItemsUsingCategory > 0) {
            return res.status(400).json({
                message: `Cannot delete category: ${menuItemsUsingCategory} menu items are using this category`
            });
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting category', error: error.message });
    }
};


module.exports = {
    login,
    resetPassword,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItems,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};