const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');
const patientController = require('../controllers/patientController');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//Menentukan lokasi penyimpanan (upload foto) dan nama file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
//Middleware JWT (REQ-334)
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Token tidak valid' });
            } else {
                req.userData = authData;
                next();
            }
        });
    } else {
        res.status(401).json({ success: false, message: 'Akses ditolak' });
    }
};

//Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

//Item Routes
router.get('/items', itemController.getItems); 
router.post('/items', upload.single('photo'), itemController.createItem); 
router.put('/items/:id', itemController.updateItem); 
router.delete('/items/:id', itemController.deleteItem); 
//Patient Routes
router.get('/patients', verifyToken, patientController.getPatients);
router.post('/patients', verifyToken, patientController.createPatient);
router.put('/patients/:id', verifyToken, patientController.updatePatient);
router.delete('/patients/:id', verifyToken, patientController.deletePatient);

module.exports = router;