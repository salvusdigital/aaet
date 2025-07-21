const router = require('express').Router();

const menuController = require('../controllers/menuController');

// Get all menu items
router.get('/', menuController.getAllItems);


// Get menu items by service type
router.get('/service/:service', menuController.getItemsByService);

// Get each menu item by id
router.get('/item/:id', menuController.getItemById);

// Get menu items by category
router.get('/category/:category', menuController.getItemsByCategory);


module.exports = router; 