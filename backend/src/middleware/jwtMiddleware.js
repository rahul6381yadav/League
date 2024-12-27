const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

exports.verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    try {
        // Verify token
        const decoded = jwt.verify(token, "mysecretkey");
        req.user = decoded.userId; // Attach user ID to request object
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.error("Token verification failed:", error.message);
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
