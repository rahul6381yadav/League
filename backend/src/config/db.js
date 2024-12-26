const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://NandiniRaj:mongo63leader@leaderboard.wfjwb.mongodb.net/?retryWrites=true&w=majority&appName=Leaderboard/Leaderboard");
        console.log("Database Connected");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1); 
    }
};

module.exports = connectDB;
