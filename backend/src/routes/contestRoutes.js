const express = require('express');
const { createContest, getContests, getRoomDetails, joinContest, getActiveContests, getContestLogs, getLogsByRoom } = require('../controller/ContestController');
const router = express.Router();

router.post('/create', createContest);
router.get('/', getContests);      
router.get('room/:roomCode', getRoomDetails);
router.post('/join', joinContest);  
router.get('/active', getActiveContests);  
router.get('/logs', getContestLogs);
router.get('/logs/:roomCode', getLogsByRoom);

module.exports = router;
