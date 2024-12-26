const express = require("express");
const router=express.Router()
const usersController = require("../controller/UserController");

router.post("/signup", usersController.UserSignup);
router.post("/login", usersController.login);
router.post('/forgot-password', usersController.forgotPassword);
router.post('/reset-password', usersController.resetPassword);
router.post('/verify-otp', usersController.verifyOtp);

module.exports = router;