const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Item Routes
router.get('/items', itemController.getAllItems);
router.post('/items/create', itemController.createItem);
router.put('/items/update/:id', itemController.updateItemStatus);
router.delete('/items/delete/:id', itemController.deleteItem);

module.exports = router;