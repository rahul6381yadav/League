const {verifyToken, authorize} = require("../middleware/jwtMiddleware");
const User = require("../model/UserModel");

exports.createUser = [
    verifyToken, // Replaced authenticate with verifyToken
    authorize("admin", "coordinator"), // Only admins or coordinators
    async (req, res) => {
        try {
            const {fullName, studentId, email, password, batchCode, photo, roles} = req.body;

            const existingUser = await User.findOne({email});
            if (existingUser) {
                return res.status(400).json({message: "User already exists", isError: true});
            }

            const newUser = new User({fullName, studentId, email, password, batchCode, photo, roles});
            await newUser.save();

            res.status(201).json({message: "User created successfully", user: newUser, isError: false});
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).json({message: "Internal Server Error", isError: true});
        }
    },
];

exports.getUsers = [
    async (req, res) => {
        try {
            const {search, role, batchCode, limit, skip, id, studentId} = req.query;

            if (id) {
                const user = await User.findById(id);
                if (!user) return res.status(404).json({message: "User not found", isError: true});
                return res.status(200).json({message: "User fetched successfully", user, isError: false});
            }

            let filter = {};
            if (search) filter.fullName = {$regex: search, $options: "i"};
            if (studentId) filter.studentId = {$regex: studentId, $option: "i"}; // Search by studentId
            if (role) filter.role = {$in: role};
            if (batchCode) filter.batchCode = batchCode;

            const users = await User.find(filter)
                .limit(limit ? parseInt(limit) : 500)
                .skip(skip ? parseInt(skip) : 0);

            res.status(200).json({message: "Users fetched successfully", users, isError: false});
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).json({message: "Internal Server Error", isError: true});
        }
    },
];


exports.updateUser = [
    async (req, res) => {
        try {
            const {id} = req.query;
            const updates = req.body;

            const updatedUser = await User.findByIdAndUpdate(id, updates, {new: true});
            if (!updatedUser) return res.status(404).json({message: "User not found", isError: true});

            res.status(200).json({message: "User updated successfully", user: updatedUser, isError: false});
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).json({message: "Internal Server Error", isError: true});
        }
    },
];



exports.deleteUser = [
    verifyToken, // Replaced authenticate with verifyToken
    authorize("admin"), // Only admins
    async (req, res) => {
        try {
            const {id} = req.query;

            const deletedUser = await User.findByIdAndDelete(id);
            if (!deletedUser) return res.status(404).json({message: "User not found", isError: true});

            res.status(200).json({message: "User deleted successfully", isError: false});
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).json({message: "Internal Server Error", isError: true});
        }
    },
];
