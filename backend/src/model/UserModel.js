const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const batchCodeEnum = {
    values: [30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19],
    message: "{VALUE} is not a valid batch code",
};

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: false,
    },
    studentId: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    photo: {
        type: String,
        default: ""
    },
    TotalPoints: {
        type: Number,
        default: 0,
        required: false,   
    },
    joiningDate: {
        type: Date,
        default: Date.now()
    },
    batchCode: {
        type: Number,
        required: false,
        enum: batchCodeEnum,
    },
    linkedin: {
        type: String,
        required: false,
    },
    twitter: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    instagram: {
        type: String,
        required: false,
    },
    github: {
        type: String,
        required: false,
    },
    resetOtp: {
        type: String,
        required: false,
    },
    resetOtpExpiry: {
        type: Date,
        required: false,
    },
    hasFirebaseId: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: true,
        enum: ["student", "admin", "cosa", "faculty"],
        default: "student"
    },

});


userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.methods.comparePassword = async function (userPassword) {
    try {
        return await bcrypt.compare(userPassword, this.password);
    } catch (error) {
        throw error;
    }
};

userSchema.methods.addPoints = function (points) {
    this.TotalPoints += points;
    return this.save(); // Save updated points to the database
};

userSchema.methods.subtractPoints = function (points) {
    this.TotalPoints = Math.max(0, this.TotalPoints - points); // Ensure points don't go negative
    return this.save();
};

userSchema.methods.resetPoints = function () {
    this.TotalPoints = 0;
    return this.save();
};


module.exports = mongoose.model("User", userSchema);
