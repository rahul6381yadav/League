const express = require("express");
const app = express();
const mongoose = require("mongoose");;
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT ||3000;
const connectDB = require('./config/db');
const userRoute = require('./routes/userRoutes'); 
const cors = require('cors');
const path = require('path');

//connect to mongodb
connectDB();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/user", userRoute);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});



app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});