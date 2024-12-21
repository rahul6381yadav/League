const express = require("express");
const app = express();
const PORT = 3000;
const connectDB = require('./config/db');
const router = require('./routes/userRoutes'); 
const cors = require('cors');
const path = require('path');

connectDB();

app.use(cors());

app.use(express.static(path.join(__dirname,'public')));

app.use(express.json());

app.use('/', router);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));