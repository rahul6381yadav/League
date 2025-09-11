const { mongoose, Schema } = require("mongoose");

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
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        required: false,
        default: []
    },
    overallRating: {
        type: Number,
        default: 0,
    },
    studentMembers: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
        default: "",
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
                user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
                rank: { type: Number, required: false },
                points: { type: Number, required: false, default: 0 }
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
    maxMember: {
        type: Number,
        default: 1,
    },
    participantsCount: {
        type: Number,
        default: 0,
    },
    photoGallery: {
        type: [String],
        default: [],
    },
    totalWinner: {
        type: Number,
        default: 0,
    },
});

// Middleware to update participantsCount based on attendance
eventSchema.pre('save', async function (next) {
    if (this.maxMember > 1) {
        try {
            // Fetch attendance for this event
            const attendanceCount = await mongoose.model('Attendance').countDocuments({ eventId: this._id });
            this.participantsCount = attendanceCount;
        } catch (error) {
            return next(error);
        }
    }
    next();
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
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: false,
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'absent',
        required: true,
    },
    comment: {
        type: String,
        default: "",
    },
    isWinner: {
        type: Boolean,
        default: false,
    },
});
const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        unique: true,
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shareId: {
        type: String,
        required: true,
        default: function () {
            // Generate a random code of 6 characters
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid ambiguous characters
            let code = "";
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }
    },
    comment: {
        type: String,
        required: false,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Middleware to validate team members against event's maxMember
teamSchema.pre('save', async function (next) {
    if (this.members && this.members.length > 0) {
        try {
            // Get the associated event
            const event = await mongoose.model('Event').findById(this.eventId);
            if (event && this.members.length > event.maxMember) {
                throw new Error(`Team members cannot exceed ${event.maxMember} as specified in the event`);
            }
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const TeamModel = mongoose.model('Team', teamSchema);
const ClubModel = mongoose.model("Club", clubSchema);
const EventModel = mongoose.model('Event', eventSchema);
const AttendanceModel = mongoose.model('Attendance', attendanceSchema);

module.exports = {
    TeamModel,
    ClubModel,
    EventModel,
    AttendanceModel,
};
