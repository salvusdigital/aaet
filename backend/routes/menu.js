const router = require('express').Router();

const menuController = require('../controllers/menuController');

// Get all menu items
router.get('/', menuController.getAllItems);

// Get menu items by category
router.get('/category/:category', menuController.getItemsByCategory);


module.exports = router; 