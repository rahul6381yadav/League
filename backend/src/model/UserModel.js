const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const batchCodeEnum = {
    values: [30,29,28,27,26,25,24,23,22,21,20,19],
    message: '{VALUE} is not a valid batch code'
};

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    batchCode: {
        type: Number,
        required: true,
        enum: batchCodeEnum
    },
    photo: {
        type: String,
        required: false
    }
});


async function saveUser(user) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashpass = await bcrypt.hash(user.password, salt);
      user.password = hashpass;
    } catch (error) {
      throw error;
    }   
}
userSchema.pre('save', async function(next) {
    await saveUser(this);
});

userSchema.methods.comparePassword = async function(userPassword) {
    try {
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

const UserModels = mongoose.model("Users", userSchema);

module.exports = {
    UserModels
};