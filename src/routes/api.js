const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Item Routes
router.get('/items', itemController.getItems); 
router.post('/items', itemController.createItem); 
router.put('/items/:id', itemController.updateItem); 
router.delete('/items/:id', itemController.deleteItem); 

module.exports = router;