const verifyToken = (req, res, next) => {
    // SRS REQ-334: Autentikasi Wajib
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        // Logika verifikasi token (JWT) seharusnya di sini
        next();
    } else {
        res.sendStatus(403); // Forbidden jika tidak login
    }
};

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');

//Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

//Item Routes
router.get('/items', itemController.getItems); 
router.post('/items', itemController.createItem); 
router.put('/items/:id', itemController.updateItem); 
router.delete('/items/:id', itemController.deleteItem); 

//patient routes
router.get('/patients', verifyToken, patientController.getPatients);
router.post('/patients', verifyToken, patientController.createPatient);
router.put('/patients/:id', verifyToken, patientController.updatePatient);
router.delete('/patients/:id', verifyToken, patientController.deletePatient);

module.exports = router;