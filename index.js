const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./src/routes/api');

const app = express();
app.use(bodyParser.json());
app.use('/api', apiRoutes);

app.listen(3000, () => {
    console.log('Server SafeGuard RSJ berjalan di port 3000');
});