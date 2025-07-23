const router = require('express').Router();
const menuController = require('../controllers/menuController');

// Get all menu items (can be filtered by category using query param)
router.get('/', menuController.getAllItems);

// Get all categories
router.get('/categories', menuController.getAllCategories);


// // 
// router.get('/:categoryId', menuController.getItemsByCategory);



// Get menu items by category ID
router.get('/category/:categoryId', menuController.getItemsByCategory);

// Get specific menu item by ID
router.get('/:id', menuController.getItemById);

module.exports = router; 