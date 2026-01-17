require('dotenv').config();

const express = require('express');
const app = express();
const apiRoutes = require('./src/routes/api');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/api', apiRoutes);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SafeGuard RSJ API Server running on port ${PORT}`);
    console.log(`Database Host: ${process.env.DB_HOST}`);
});