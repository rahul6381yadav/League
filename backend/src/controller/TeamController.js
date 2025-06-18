const { TeamModel, EventModel, AttendanceModel } = require("../model/ClubModel");
const User = require("../model/UserModel");
const { generateRandomCode } = require("../utils/helpers");

// Create a new team
exports.createTeam = async (req, res) => {
    try {
        const { teamName, eventId } = req.body;
        const leaderId = req.user.id;

        if (!teamName || !eventId) {
            return res.status(400).json({ message: "Team name and event ID are required", isError: true });
        }

        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found", isError: true });
        }

        const shareId = generateRandomCode(6);

        const team = new TeamModel({
            teamName,
            eventId,
            leader: leaderId,
            members: [leaderId],
            shareId,
        });

        await team.save();

        res.status(201).json({ message: "Team created successfully", team, isError: false });
    } catch (error) {
        console.error("Error creating team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Update team details
exports.updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { teamName, members } = req.body;
        const userId = req.user.id;

        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        if (team.leader.toString() !== userId) {
            return res.status(403).json({ message: "Only the team leader can update the team", isError: true });
        }

        if (teamName) team.teamName = teamName;
        if (members) team.members = [...new Set([...team.members, ...members])];

        await team.save();

        res.status(200).json({ message: "Team updated successfully", team, isError: false });
    } catch (error) {
        console.error("Error updating team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Join a team using share ID
exports.joinTeam = async (req, res) => {
    try {
        const { shareId } = req.body;
        const userId = req.user.id;

        const team = await TeamModel.findOne({ shareId });
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        const event = await EventModel.findById(team.eventId);
        if (team.members.length >= event.maxMember) {
            return res.status(400).json({ message: "Team is already full", isError: true });
        }

        if (team.members.includes(userId)) {
            return res.status(400).json({ message: "You are already a member of this team", isError: true });
        }

        team.members.push(userId);
        await team.save();

        res.status(200).json({ message: "Successfully joined the team", team, isError: false });
    } catch (error) {
        console.error("Error joining team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Mark attendance for team members
exports.markAttendance = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { attendance } = req.body; // Array of { memberId, status, pointsGiven, comment }
        const userId = req.user.id;

        const team = await TeamModel.findById(teamId).populate("eventId");
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        const event = await EventModel.findById(team.eventId);
        if (!event.clubIds.some(clubId => clubId.toString() === userId)) {
            return res.status(403).json({ message: "Only coordinators can mark attendance", isError: true });
        }

        const attendanceRecords = [];
        for (const { memberId, status, pointsGiven, comment } of attendance) {
            const record = await AttendanceModel.findOneAndUpdate(
                { studentId: memberId, eventId: team.eventId },
                { status, pointsGiven, comment },
                { upsert: true, new: true }
            );
            attendanceRecords.push(record);

            if (status === "present" && pointsGiven > 0) {
                const user = await User.findById(memberId);
                user.TotalPoints = (user.TotalPoints || 0) + pointsGiven;
                await user.save();
            }
        }

        res.status(200).json({ message: "Attendance marked successfully", attendanceRecords, isError: false });
    } catch (error) {
        console.error("Error marking attendance:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};
// update attendance for a team
exports.updateAttendance = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { attendance } = req.body; // Array of { memberId, status, pointsGiven, comment }
        const userId = req.user.id;

        const team = await TeamModel.findById(teamId).populate("eventId");
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        const event = await EventModel.findById(team.eventId);
        if (!event.clubIds.some(clubId => clubId.toString() === userId)) {
            return res.status(403).json({ message: "Only coordinators can update attendance", isError: true });
        }

        const attendanceRecords = [];
        for (const { memberId, status, pointsGiven, comment } of attendance) {
            const record = await AttendanceModel.findOneAndUpdate(
                { studentId: memberId, eventId: team.eventId },
                { status, pointsGiven, comment },
                { new: true }
            );
            attendanceRecords.push(record);

            if (status === "present" && pointsGiven > 0) {
                const user = await User.findById(memberId);
                if (user) {
                    user.TotalPoints = (user.TotalPoints || 0) + pointsGiven;
                    await user.save();
                }
            }
        }
        res.status(200).json({ message: "Attendance updated successfully", attendanceRecords, isError: false });
    }
    catch (error) {
        console.error("Error updating attendance:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
}

// Delete a team
exports.deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.id;

        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        if (team.leader.toString() !== userId) {
            const event = await EventModel.findById(team.eventId);
            if (!event.clubIds.some(clubId => clubId.toString() === userId)) {
                return res.status(403).json({ message: "Only the team leader or coordinators can delete the team", isError: true });
            }
        }

        const attendancesToDelete = await AttendanceModel.find({ teamId: team._id });
        for (const attendance of attendancesToDelete) {
            if (attendance.status === "present" && attendance.pointsGiven > 0) {
                const user = await User.findById(attendance.studentId);
                if (user) {
                    user.TotalPoints = Math.max(0, (user.TotalPoints || 0) - attendance.pointsGiven);
                    await user.save();
                }
            }
        }

        await AttendanceModel.deleteMany({ teamId: team._id });
        await TeamModel.findByIdAndDelete(teamId);

        res.status(200).json({ message: "Team deleted successfully", isError: false });
    } catch (error) {
        console.error("Error deleting team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// get a team by different parameters
exports.getTeam = async (req, res) => {
    try {
        const { teamId, eventId, shareId } = req.query;

        let filter = {};
        if (teamId) filter._id = teamId;
        if (eventId) filter.eventId = eventId;
        if (shareId) filter.shareId = shareId;

        const team = await TeamModel.findOne(filter).populate("eventId leader members");
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        res.status(200).json({ message: "Team fetched successfully", team, isError: false });
    } catch (error) {
        console.error("Error fetching team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};


