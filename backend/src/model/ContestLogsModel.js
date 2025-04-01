const mongoose = require('mongoose');

const contestLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['join_room', 'leave_room', 'contest_message', 'room_message']
  },
  roomCode: {
    type: String,
    required: true
  },
  user: {
    name: String,
    rollNumber: String,
    leetcodeUsername: String
  },
  message: String,
  url: String,
  category: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    default: 'info'
  }
});

module.exports = mongoose.model('contestLog', contestLogSchema);