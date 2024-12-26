const express = require("express");
const router = express.Router();
const jwtMiddleware = require("../middleware/jwtMiddleware");

// Protected route requiring token verification
router.get("/protected", jwtMiddleware.verifyToken, (req, res) => {
    res.status(200).json({ message: "You are authorized!", userId: req.user });
});

module.exports = router;
