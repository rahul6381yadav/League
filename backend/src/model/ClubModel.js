const {mongoose, Schema} = require("mongoose");

const clubSchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    members: {
      type: [{type: Schema.Types.ObjectId, ref: 'User'}],
      required: true
    },
    overallRating: {
      type: Number,
      default: 0,
    },
    studentMembers:{
      type: [{type: Schema.Types.ObjectId, ref: 'User'}],
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now(),
    },
});


const eventSchema = new Schema({
  clubIds: [
      {
          type: Schema.Types.ObjectId,
          ref: 'Club',
          required: true, // At least one club is required
      },
  ],
  eventName: {
      type: String,
      required: true,
  },
  description: {
      type: String,
      default: null,
  },
  vanue: {
      type: String,
      required: true,
  },
  duration: {
      type: String,
      required: true,
  },
  maxPoints: {
      type: Number,
      required: true,
  },
  date: {
      type: Date,
      required: true,
  },
  participantsCount: {
      type: Number,
      default: 0,
  },
  photoGallery: {
      type: [String],
      default: [],
  },
});

  const attendanceSchema = new mongoose.Schema({
    studentId: {
      type: [{type: Schema.Types.ObjectId, ref: 'User'}],
      required: true,
    },
    eventId: {
      type: [{type: Schema.Types.ObjectId, ref: 'Event'}],
      required: true,
    },
    pointsGiven: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'], 
      default: 'Absent',
      required: true,
    },
    isWinner: {
      type: Boolean,
      default: false,
    },
});


const ClubModel = mongoose.model("Club", clubSchema);
const EventModel = mongoose.model('Event', eventSchema);
const AttendanceModel = mongoose.model('Attendance', attendanceSchema);

module.exports = {
  ClubModel,
  EventModel,
  AttendanceModel,
};
