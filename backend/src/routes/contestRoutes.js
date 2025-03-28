const express = require('express');
const { createContest, getContests, getRoomDetails, joinContest, getActiveContests } = require('../controller/ContestController');
const router = express.Router();

router.post('/create', createContest);
router.get('/', getContests);      
router.get('room/:roomCode', getRoomDetails);
router.post('/join', joinContest);  
router.get('/active', getActiveContests);  

module.exports = router;
