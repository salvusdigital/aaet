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
    try {
        const menuItem = new MenuItem(req.body);
        await menuItem.save();
        res.status(201).json(menuItem);
    } catch (error) {
        res.status(400).json({ message: 'Error creating menu item', error: error.message });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(400).json({ message: 'Error updating menu item', error: error.message });
    }
};

const deleteMenuItem = async (req, res) => {
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
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
};


const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
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
    // createCategory,
    // updateCategory,
    deleteCategory
};