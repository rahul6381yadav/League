const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const User = require("../model/UserModel");
const crypto = require('crypto');

exports.UserSignup = async (req, res) => {
    try {
        const { fullName, studentId, email, password, batchCode, photo } = req.body;

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists" })
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
        res.status(201).json({ message: "User created successfully" })

    } catch (error) {
        console.log("Error:" + error.message)
        res.status(500).json({ message: "Internal Server Error" })
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
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP and expiry in the user's record
        user.resetOtp = `${otp}`;
        console.log("Your sent otp is ", otp)
        user.resetOtpExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 10 minutes
        await user.save();

        // Send OTP via email
        const subject = 'Password Reset OTP';
        const text = `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`;
        await sendEmail(user.email, subject, text);

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        console.log("Request received:", req.body);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User found:", user);
        console.log("Current Time:", Date.now(), "Expiry Time:", user.resetOtpExpiry);
        if (!user.resetOtp || user.resetOtpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Request a new one." });
        }
        console.log("Stored OTP:", user.resetOtp, "Provided OTP:", otp);
        if (user.resetOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // OTP is valid, clear it and allow password reset
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        await user.save();

        res.status(200).json({ message: "OTP verified. You can now reset your password." });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        console.log("inside ");
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


