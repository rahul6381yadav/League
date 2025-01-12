const { AttendanceModel } = require("../model/ClubModel");

// Mark attendance
exports.participate = async (req, res) => {
    try {
        const { studentId, eventId, pointsGiven, status, isWinner } = req.body;

        const newParticipation = new AttendanceModel({
            studentId,
            eventId
        }).populate("studentId eventId");

        await newParticipation.save();
        console.log(newParticipation);
        res.status(201).json({ message: "Partcipation successfull!!!", participation: newParticipation, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Get attendance records with optional filters
exports.getPartcipation = async (req, res) => {
    try {
        const { studentId, eventId, status, limit, skip, pointsGreaterThan, pointsLessThan } = req.query;

        let filter = {};
        if (studentId) filter.studentId = studentId;
        if (eventId) filter.eventId = eventId;
        if (status) filter.status = status;
        if (pointsGreaterThan) {
            filter.pointsGiven = { $gte: pointsGreaterThan };
        }
        if (pointsLessThan) {
            filter.pointsGiven = { ...(filter.pointsGiven || {}), $lte: pointsLessThan };
        }

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

        const updatedAttendance = await AttendanceModel.findByIdAndUpdate(id, updates, { new: false }).populate("studentId eventId");
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
