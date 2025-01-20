const { AttendanceModel } = require("../model/ClubModel");
const User = require("../model/UserModel");


exports.participate = async (req, res) => {
    try {
        const { participations } = req.body; // Array of objects: [{ studentId, eventId, pointsGiven, status }]
        if (!Array.isArray(participations) || participations.length === 0) {
            return res.status(400).json({ message: "Participation data is required", isError: true });
        }

        const attendanceDocs = [];
        const studentPointsUpdates = {};

        for (const participation of participations) {
            const { studentId, eventId, pointsGiven, status } = participation;

            const existingAttendance = await AttendanceModel.findOne({ studentId, eventId });
            if (existingAttendance) {
                return res.status(400).json({
                    message: `Student  has already attended the event`,
                    isError: true,
                });
            }

            // Prepare attendance record
            const attendance = {
                studentId,
                eventId,
                pointsGiven: status === "present" ? pointsGiven : 0,
                status,
            };
            attendanceDocs.push(attendance);

            // Aggregate points for each student if status is "present"
            if (status === "present" && pointsGiven > 0) {
                studentPointsUpdates[studentId] = (studentPointsUpdates[studentId] || 0) + pointsGiven;
            }
        }

        // Save attendance records
        const savedParticipations = await AttendanceModel.insertMany(attendanceDocs);

        // Update TotalPoints for users
        for (const [studentId, points] of Object.entries(studentPointsUpdates)) {
            const student = await User.findById(studentId);
            if (student) {
                student.TotalPoints = (student.TotalPoints || 0) + points;
                await student.save();
            }
        }

        // Fetch and populate saved participation records
        const populatedParticipations = await AttendanceModel.find({
            _id: { $in: savedParticipations.map(p => p._id) },
        }).populate("studentId eventId");

        res.status(201).json({
            message: "Participation recorded successfully",
            attendanceRecords: populatedParticipations,
            isError: false,
        });

    } catch (error) {
        console.error("Error in participate:", error.message);
        res.status(500).json({message: "Internal Server Error", isError: true});
    }
};



// Get attendance records with optional filters
exports.getParticipation = async (req, res) => {
    try {
        const {studentId, eventId, status, limit, skip, pointsGreaterThan, pointsLessThan} = req.query;

        let filter = {};
        if (studentId) filter.studentId = mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : studentId;
        if (eventId) filter.eventId = eventId;
        if (status) filter.status = status;
        if (pointsGreaterThan) {
            filter.pointsGiven = {$gte: pointsGreaterThan};
        }
        if (pointsLessThan) {
            filter.pointsGiven = {...(filter.pointsGiven || {}), $lte: pointsLessThan};
        }

        const records = await AttendanceModel.find(filter)
            .populate("studentId eventId")
            .limit(limit ? parseInt(limit) : 30)
            .skip(skip ? parseInt(skip) : 0);

        res.status(200).json({message: "Attendance records fetched successfully", records, isError: false});
    } catch (error) {
        console.error("Error in getParticipation:", error.message);
        res.status(500).json({message: "Internal Server Error", isError: true});
    }
};


// Update attendance for multiple students
exports.updateAttendance = async (req, res) => {
    try {
        const { updates } = req.body;
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: "Updates data is required", isError: true });
        }

        const bulkOps = updates.map(({ id, status, pointsGiven }) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { status, pointsGiven } }
            }
        }));

        await AttendanceModel.bulkWrite(bulkOps);

        // Optionally, update student points in a separate loop if needed
        for (const update of updates) {
            if (update.status === "present" && update.pointsGiven > 0) {
                const student = await User.findById(update.studentId);
                if (student) {
                    student.TotalPoints = (student.TotalPoints || 0) + update.pointsGiven;
                    await student.save();
                }
            }
        }

        res.status(200).json({ message: "Attendance updated successfully", isError: false });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error", isError: true});
    }
};

// Delete attendance record by ID
exports.deleteAttendance = async (req, res) => {
    try {
        const {id} = req.query;

        const deletedAttendance = await AttendanceModel.findByIdAndDelete(id);
        if (!deletedAttendance) return res.status(404).json({message: "Attendance not found", isError: true});

        res.status(200).json({message: "Attendance deleted successfully", isError: false});
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error", isError: true});
    }
};
