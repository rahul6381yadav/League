const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/UserModel"); // Import User model
const {ClubModel} = require("../model/ClubModel")

dotenv.config();

exports.verifyToken = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(403).json({message: "No token provided", isError: true});
    }

    try {
        // Verify token using the secret from environment variables
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // let user;
        //
        // if(decoded.clubId){
        //     user = await ClubModel.findById(decoded.clubId); // Fetch user details (exclude password)
        // }else{
        //     user = await User.findById(decoded.userId); // Fetch user details (exclude password)
        // }
        //
        // if (!user) {
        //     return res.status(404).json({ message: "User not found", isError: true });
        // }
        //
        // req.user = user; // Attach the full user object to the request
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.error("Token verification failed:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({message: "Token has expired", isError: true});
        }

        res.status(401).json({message: "Unauthorized: Invalid token", isError: true});
    }
};

exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.roles[0])) {
            return res.status(403).json({message: "Access denied", isError: true});
        }

        const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({message: "Access denied: Unauthorized role", isError: true});
        }
        next(); // Proceed if the user's role is authorized
    };
};
