const express = require("express");
const router = express.Router();
const jwtMiddleware = require("../middleware/jwtMiddleware");
const clubController = require("../controller/ClubController");

// Protected route requiring token verification
router.get("/protected", jwtMiddleware.verifyToken, (req, res) => {
    res.status(200).json({ message: "You are authorized!", userId: req.user });
});

router.get("/club", jwtMiddleware.verifyToken, clubController.getClubs);
router.post("/club", jwtMiddleware.verifyToken, clubController.createClub);
router.put("/club", jwtMiddleware.verifyToken, clubController.updateClub);
router.delete("/club", jwtMiddleware.verifyToken, clubController.deleteClub);

module.exports = router;