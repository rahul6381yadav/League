const {mongoose, Schema} = require("mongoose");

const clubSchema = new mongoose.Schema({
    coordinator1: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coordinator2: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: false,
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
        required: false,
        default: []
    },
    overallRating: {
        type: Number,
        default: 0,
    },
    studentMembers: {
        type: [{type: Schema.Types.ObjectId, ref: 'User'}],
        required: false,
        default: []
    },
    hasFirebaseId: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now(),
    },
    role: {
        type: String,
        default: "coordinator"
    }
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
    photo: {
        type: String,
        default:"",
    },
    description: {
        type: String,
        default: null,
    },
    venue: {
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
    endDate: {
        type: Date,
        required: false,
    },
    winners: {
        type: [
            {
                user: {type: Schema.Types.ObjectId, ref: 'User', required: false},
                rank: {type: Number, required: false},
                points: {type: Number, required: false, default: 0}
            }
        ],
        default: []
    },
    status: {
        type: String,
        required: false,
        enum: ["Cancelled", "Scheduled", "Upcoming", "Past", "Active", "Draft"],
        default: "Draft"
    },
    participantsCount: {
        type: Number,
        default: 0,
    },
    photoGallery: {
        type: [String],
        default: [],
    },
    totalWinner:{
        type:Number,
        default: 0,
    }
});

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    pointsGiven: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'absent',
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
