const express = require('express');
const app = express();
const apiRoutes = require('./src/routes/api');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/api', apiRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});