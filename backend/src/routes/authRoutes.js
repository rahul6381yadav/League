const express = require("express");
const router = express.Router();
const jwtMiddleware = require("../middleware/jwtMiddleware");
const clubController = require("../controller/ClubController");
const eventController = require("../controller/EventController")
const attendanceController = require("../controller/AttendanceController")

// Protected route requiring token verification
router.get("/protected", jwtMiddleware.verifyToken, (req, res) => {
    res.status(200).json({message: "You are authorized!", userId: req.user});
});

router.get("/club", jwtMiddleware.verifyToken, clubController.getClubs);
// router.post("/club", jwtMiddleware.verifyToken, clubController.createClub);
router.put("/club", jwtMiddleware.verifyToken, clubController.updateClub);
router.delete("/club", jwtMiddleware.verifyToken, clubController.deleteClub);

router.get("/club/events", eventController.getEvents);
router.post("/club/all-events", eventController.getAllEvents);
router.post("/club/events", jwtMiddleware.verifyToken, eventController.createEvent);
router.put("/club/events", jwtMiddleware.verifyToken, eventController.updateEvent);
router.delete("/club/events", jwtMiddleware.verifyToken, eventController.deleteEvent);

router.get("/club/attendance", jwtMiddleware.verifyToken, attendanceController.getParticipation);
router.post("/club/attendance", jwtMiddleware.verifyToken, attendanceController.participate);
router.put("/club/attendance", jwtMiddleware.verifyToken, attendanceController.updateAttendance);
router.delete("/club/attendance", jwtMiddleware.verifyToken, attendanceController.deleteAttendance);


module.exports = router;