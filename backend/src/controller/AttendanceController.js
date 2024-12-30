const { AttendanceModel } = require("../model/ClubModel");

// Mark attendance
exports.markAttendance = async (req, res) => {
    try {
        const { studentId, eventId, pointsGiven, status, isWinner } = req.body;

        const newAttendance = new AttendanceModel({
            studentId,
            eventId,
            pointsGiven,
            status,
            isWinner,
        });

        await newAttendance.save();
        res.status(201).json({ message: "Attendance marked successfully", attendance: newAttendance, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Get attendance records with optional filters
exports.getAttendanceRecords = async (req, res) => {
    try {
        const { studentId, eventId, status, limit, skip } = req.query;

        let filter = {};
        if (studentId) filter.studentId = studentId;
        if (eventId) filter.eventId = eventId;
        if (status) filter.status = status;

        const records = await AttendanceModel.find(filter)
            .populate("studentId eventId")
            .limit(limit ? parseInt(limit) : 30)
            .skip(skip ? parseInt(skip) : 0);

        res.status(200).json({ message: "Attendance records fetched successfully", records, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Update attendance by ID
exports.updateAttendance = async (req, res) => {
    try {
        const { id } = req.query;
        const updates = req.body;

        const updatedAttendance = await AttendanceModel.findByIdAndUpdate(id, updates, { new: true }).populate("studentId eventId");
        if (!updatedAttendance) return res.status(404).json({ message: "Attendance not found", isError: true });

        res.status(200).json({ message: "Attendance updated successfully", attendance: updatedAttendance, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Delete attendance record by ID
exports.deleteAttendance = async (req, res) => {
    try {
        const { id } = req.query;

        const deletedAttendance = await AttendanceModel.findByIdAndDelete(id);
        if (!deletedAttendance) return res.status(404).json({ message: "Attendance not found", isError: true });

        res.status(200).json({ message: "Attendance deleted successfully", isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};
