const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
    club_id: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    total_points: {
      type: Number,
      default: 0,
    },
    overall_rating: {
      type: Number,
      default: 0,
    },
});


const eventSchema = new mongoose.Schema({
    club_id:{
        type:Number,
        required:true
    },
    event_id: {
      type: Number,
      unique: true, 
    },
    event_name: {
      type: String,
      required: true, 
    },
    description: {
      type: String,
      default: null,
    },
    date: {
      type: Date,
      required: true, 
    },
    participants_count: {
      type: Number,
      default: 0,
    },
    winners: {
      type: [String], 
      default: [], 
    },
    photo_gallery: {
      type: [String],
      default: [],
    },
    
  });

  const attendanceSchema = new mongoose.Schema({
    student_id: {
      type: Number,
      unique: true, 
    },
    event_id: {
      type: Number, 
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'], 
      required: true,
    },
});


const Club = mongoose.model("Club", clubSchema);
const Event = mongoose.model('Event', eventSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = {
    Club,
    Event,
    Attendance,
  };
