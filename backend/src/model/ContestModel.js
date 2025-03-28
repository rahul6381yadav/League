const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roomCode: { type: String, unique: true, required: true },
    duration: { type: Number, required: true },  
    startTime: { type: Date, default: Date.now },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // Reference User model
});

module.exports = mongoose.model('Contest', contestSchema);
