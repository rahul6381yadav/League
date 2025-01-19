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
    joiningDate: {
        type: Date,
        default: Date.now()
    },
    batchCode: {
        type: Number,
        required: false,
        enum: batchCodeEnum,
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

module.exports = mongoose.model("User", userSchema);
