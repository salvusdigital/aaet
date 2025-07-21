const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/login', adminController.login);
// Reset password route
router.post('/reset-password', auth, adminController.resetPassword);

// router.post('/register', adminController.register);

// Menu management routes (protected by auth middleware)
router.get('/menu', auth, adminController.getMenuItems);
router.post('/menu', auth, adminController.createMenuItem);
router.put('/menu/:id', auth, adminController.updateMenuItem);
router.delete('/menu/:id', auth, adminController.deleteMenuItem);

router.get('/categories', auth, adminController.getCategories);
// router.post('/categories', auth, adminController.createCategory);
// router.put('/categories/:id', auth, adminController.updateCategory);
router.delete('/categories/:id', auth, adminController.deleteCategory);


module.exports = router;