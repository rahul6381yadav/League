const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const User = require("../model/UserModel");
const crypto = require('crypto');
const {ClubModel} = require('../model/ClubModel');

exports.UserSignup = async (req, res) => {
    try {
        const {role} = req.body;
        if (role == "coordinator") {
            const {email, coordinator1, name} = req.body;
            if (!email || !coordinator1) {
                return res.status(400).json({message: "Email & Coordinator Id is Required"});
            }
            const club = await ClubModel.findOne({email});
            if (club) {
                return res.status(400).json({message: "Club already exists"});
            }

            const newClub = new ClubModel(req.body);
            await newClub.save();
            return res.status(201).json({message: "Club created successfully", club: newClub})
        } else {
            const {email, role} = req.body;
            if (!email || !role) {
                return res.status(400).json({message: "Email & Role is Required"});
            }
            const user = await User.findOne({email});
            if (user) {
                return res.status(400).json({message: "User already exists"});
            }
            const newUser = new User(req.body);
            await newUser.save();
            return res.status(201).json({message: "User created successfully", user: newUser});
        }

    } catch (error) {
        console.log("Error:" + error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
};

exports.login = async (req, res) => {
    try {
        const {email, role, fullName, photo} = req.body;
        if (!email || !role) {
            return res.status(400).json({message: "Email and role are required"});
        }

        if (role == "coordinator") {
            let club = await ClubModel.findOne({email});
            if (!club) {
                return res.status(404).json({message: "Club not found"});
            } else if (!club.hasFirebaseId) {

                // const updateData = {
                //     name:fullName,
                //     image:photo,
                //     lastUpdated: Date.now()
                // }
                const updateData = {
                    lastUpdated: Date.now()
                }

                club = await ClubModel.findOneAndUpdate({email: email}, updateData, {new: false})
            }

            const token = jwt.sign({
                clubId: club._id,
                email: club.email,
                coordinator1_Id: club.coordinator1,
                clubName: club.name
            }, process.env.JWT_SECRET, {expiresIn: '1h'});
            res.status(200).json({message: "Login successful", token, email: club.email});
        } else {
            let user = await User.findOne({email});
            if (!user) {
                return res.status(404).json({message: "User not found"});
            } else if (!user.hasFirebaseId) {
                // const updateData = {
                //     role,
                //     fullName,
                //     photo,
                //     lastUpdated: Date.now()
                // }
                const updateData = {
                    lastUpdated: Date.now()
                }
                user = await User.findOneAndUpdate({email: email}, updateData, {new: false})
            }

            if (user.role != role) {
                return res.status(403).json({message: "Access denied"});
            }

            console.log("user.role: ", user.role, " ", role);
            const token = jwt.sign({
                userId: user._id,
                role: role,
                email: user.email,
                fullName: user.fullName
            }, process.env.JWT_SECRET, {expiresIn: '365d'});
            res.status(200).json({message: "Login successful", token, user  : user});
        }

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }

};

exports.forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({message: "User not found"});
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

        res.status(200).json({message: "OTP sent to your email"});
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const {email, otp} = req.body;

        console.log("Request received:", req.body);
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        console.log("User found:", user);
        console.log("Current Time:", Date.now(), "Expiry Time:", user.resetOtpExpiry);
        if (!user.resetOtp || user.resetOtpExpiry < Date.now()) {
            return res.status(400).json({message: "OTP has expired. Request a new one."});
        }
        console.log("Stored OTP:", user.resetOtp, "Provided OTP:", otp);
        if (user.resetOtp !== otp) {
            return res.status(400).json({message: "Invalid OTP"});
        }

        // OTP is valid, clear it and allow password reset
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        await user.save();

        res.status(200).json({message: "OTP verified. You can now reset your password."});
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};
exports.leeTrackLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({message: "Email and password are required"});
        }

        let user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(password==user.LeeTrack)
        if (user.role != "student") {
            return res.status(403).json({message: "Access denied"});
        }
        const token = jwt.sign({
            userId: user._id,
            role: user.role,
            email: user.email,
            fullName: user.fullName
        }, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.status(200).json({message: "Login successful", token, user  : user});
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}
exports.resetPassword = async (req, res) => {
    try {
        const {email, newPassword} = req.body;

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({message: "Password reset successfully"});
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};


