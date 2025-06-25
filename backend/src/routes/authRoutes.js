const express = require("express");
const router = express.Router();
const jwtMiddleware = require("../middleware/jwtMiddleware");
const clubController = require("../controller/ClubController");
const eventController = require("../controller/EventController")
const attendanceController = require("../controller/AttendanceController")
const teamController = require('../controller/TeamController');

// Protected route requiring token verification
router.get("/protected", jwtMiddleware.verifyToken, (req, res) => {
    res.status(200).json({ message: "You are authorized!", userId: req.user });
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

// for attendanceController routes for non-event participation
router.get('/club/non-participants', jwtMiddleware.verifyToken, attendanceController.getNonParticipants);


router.post('/eventTeam/create', jwtMiddleware.verifyToken, teamController.createTeam);
router.post('/eventTeam/createTeam', jwtMiddleware.verifyToken, teamController.createTeamByCoordinator);
router.get('/eventTeam/getTeam', jwtMiddleware.verifyToken, teamController.getTeam);
router.put('/eventTeam/:teamId', jwtMiddleware.verifyToken, teamController.updateTeam);
router.delete('/eventTeam/:teamId', jwtMiddleware.verifyToken, teamController.deleteTeam);
router.post('/eventTeam/join', jwtMiddleware.verifyToken, teamController.joinTeam);
router.post('/eventTeam/removeMember', jwtMiddleware.verifyToken, teamController.removeMember);
router.post('/eventTeam/leave', jwtMiddleware.verifyToken, teamController.leaveTeam);
router.get('/eventTeam/getAttendance/:teamId', jwtMiddleware.verifyToken, teamController.getAttendance);
router.post('/eventTeam/:teamId/attendance', jwtMiddleware.verifyToken, teamController.markAttendance);
router.put('/eventTeam/:teamId/attendance', jwtMiddleware.verifyToken, teamController.updateAttendance);

module.exports = router;