const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const  User  = require("../model/UserModel");

exports.UserSignup = async (req, res) => {
    try {
        const { fullName, studentId, email, password, batchCode, photo} = req.body;

        const user =  await User.findOne({email})
        if(user) {
            return res.status(400).json({message:"User already exists"})
        }

        const createUser = new User({
            fullName,
            studentId,
            email,
            password,
            batchCode,
            photo,
        });
        await createUser.save()
        res.status(201).json({message:"User created successfully"})

    } catch(error) {
        console.log("Error:" +error.message)
        res.status(500).json({message:"Internal Server Error"})
    }


};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }


};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        
        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',  
        });

       
        const resetUrl = `http://localhost:4000/user/reset-password/${resetToken}`;

        
        const subject = 'Password Reset Request';
        const text = `You requested a password reset. Click on the following link to reset your password: ${resetUrl}`;

        await sendEmail(user.email, subject, text);

        res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token is missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: "Invalid or malformed token" });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};


