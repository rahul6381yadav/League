const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/Leaderboard");
        console.log("Database Connected");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1); 
    }
};

module.exports = connectDB;
