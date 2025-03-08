const express = require("express");
const router = express.Router()
const jwtMiddleware = require("../middleware/jwtMiddleware");
const usersController = require("../controller/UserController");
const usersController2 = require("../controller/UserController2");
const {verifyToken, authorize} = require("../middleware/jwtMiddleware");


router.post("/signup", usersController.UserSignup);
router.post("/login", usersController.login);
router.post('/forgot-password', usersController.forgotPassword);
router.post('/reset-password', usersController.resetPassword);
router.post('/verify-otp', usersController.verifyOtp);

router.get("/profile", jwtMiddleware.verifyToken, usersController2.getUsers);
// router.post("/create-user", verifyToken, authorize("admin"), usersController2.createUser);
router.put("/profile", jwtMiddleware.verifyToken, usersController2.updateUser);
// router.delete("/delete-user", verifyToken, usersController2.deleteUser);

module.exports = router;