const { TeamModel, EventModel, AttendanceModel } = require("../model/ClubModel");
const User = require("../model/UserModel");
const { generateRandomCode } = require("../utils/helpers");

// Create a new team
exports.createTeam = async (req, res) => {
    try {
        const { teamName, eventId } = req.body;
        const leaderId = req.user._id; // Make sure we're using _id from the user object

        if (!teamName) {
            return res.status(400).json({ message: "Team name are required", isError: true });
        }
        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required", isError: true });
        }

        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found", isError: true });
        }

        // Generate a unique team code that doesn't exist for this event
        let shareId;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            shareId = generateRandomCode(6);

            // Check if this code already exists for this event
            const existingTeam = await TeamModel.findOne({
                eventId,
                shareId
            });

            if (!existingTeam) {
                isUnique = true;
            }

            attempts++;
        }

        // If we couldn't generate a unique code after several attempts, generate one with more characters
        if (!isUnique) {
            shareId = generateRandomCode(8);
        }

        const team = new TeamModel({
            teamName,
            eventId,
            leader: leaderId,
            members: [leaderId],
            teamPoints: 0,
            comment: "",
            shareId, // Explicitly set the shareId
        });

        const savedTeam = await team.save();

        // Create attendance record for team leader with default "absent" status
        const leaderAttendance = new AttendanceModel({
            studentId: leaderId,
            eventId: eventId,
            teamId: savedTeam._id,
            status: 'absent',
            pointsGiven: 0
        });

        await leaderAttendance.save();

        // Populate the necessary fields before responding
        const populatedTeam = await TeamModel.findById(savedTeam._id)
            .populate('leader')
            .populate('members');

        res.status(201).json({
            message: "Team created successfully",
            team: populatedTeam,
            isError: false
        });
    } catch (error) {
        console.error("Error creating team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// similary create a team by coordinator
exports.createTeamByCoordinator = async (req, res) => {
    try {
        const { teamName, eventId, leaderId } = req.body;
        if (!teamName) {
            return res.status(400).json({ message: "Team name is required", isError: true });
        }
        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required", isError: true });
        }
        if (!leaderId) {
            return res.status(400).json({ message: "Leader ID is required", isError: true });
        }
        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found", isError: true });
        }
        // Generate a unique team code that doesn't exist for this event
        let shareId;
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
            shareId = generateRandomCode(6);
            // Check if this code already exists for this event
            const existingTeam = await TeamModel.findOne({
                eventId,
                shareId
            });
            if (!existingTeam) {
                isUnique = true;
            }
            attempts++;
        }
        // If we couldn't generate a unique code after several attempts, generate one with more characters
        if (!isUnique) {
            shareId = generateRandomCode(8);
        }
        const team = new TeamModel({
            teamName,
            eventId,
            leader: leaderId,
            members: [leaderId],
            teamPoints: 0,
            comment: "",
            shareId, // Explicitly set the shareId
        });
        const savedTeam = await team.save();
        // Create attendance record for team leader with default "absent" status
        const leaderAttendance = new AttendanceModel({
            studentId: leaderId,
            eventId: eventId,
            teamId: savedTeam._id,
            status: 'absent',
            pointsGiven: 0
        });
        await leaderAttendance.save();
        // Populate the necessary fields before responding
        const populatedTeam = await TeamModel.findById(savedTeam._id)
            .populate('leader')
            .populate('members');
        res.status(201).json({
            message: "Team created successfully by coordinator",
            team: populatedTeam,
            isError: false
        });
    } catch (error) {
        console.error("Error creating team by coordinator:", error.message);
        res.status(500).json({
            message: "Internal Server Error", isError: true
        });
    }
};
                

// Update team details
exports.updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { teamName, members, teamPoints} = req.body;

        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        if (teamName) team.teamName = teamName;
        if (typeof teamPoints === "number") {
            team.teamPoints = teamPoints; // ensures >= 0
            await team.save();
        }


        if (members) {
            const newMembers = members.filter(
                (member) => !team.members.includes(member)
            );
            team.members = [...new Set([...team.members, ...members])];

            // Create attendance records for new members
            for (const memberId of newMembers) {
                const attendanceRecord = new AttendanceModel({
                    studentId: memberId,
                    eventId: team.eventId,
                    teamId: team._id,
                    status: 'absent',
                    pointsGiven: 0,
                });
                await attendanceRecord.save();
            }
        }

        await team.save();

        res.status(200).json({ message: "Team updated successfully", team, isError: false });
    } catch (error) {
        console.error("Error updating team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Remove a member from a team (for team leader)
exports.removeMember = async (req, res) => {
    try {
        const { teamId, memberId } = req.body;

        if (!teamId || !memberId) {
            return res.status(400).json({ message: "Team ID and member ID are required", isError: true });
        }

        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        // Check if the member exists in the team
        if (!team.members.some(member => member.toString() === memberId)) {
            return res.status(404).json({ message: "Member not found in this team", isError: true });
        }

        // Remove the member from the team
        team.members = team.members.filter(member => member.toString() !== memberId);
        await team.save();

        // Delete attendance record for the removed member
        await AttendanceModel.deleteOne({
            studentId: memberId.toString(),
            teamId: teamId.toString()
        });

        // Return the updated team with populated fields
        const updatedTeam = await TeamModel.findById(teamId)
            .populate('leader')
            .populate('members');

        res.status(200).json({ message: "Member removed successfully", team: updatedTeam, isError: false });
    } catch (error) {
        console.error("Error removing team member:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Leave team (for regular members)
exports.leaveTeam = async (req, res) => {
    try {
        const { teamId } = req.body;
        const userId = req.user._id;

        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required", isError: true });
        }

        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        // Check if the user is a member of the team
        if (!team.members.some(member => member.toString() === userId.toString())) {
            return res.status(404).json({ message: "You are not a member of this team", isError: true });
        }

        // Check if the user is the leader (leaders can't leave, they must delete the team)
        if (team.leader.toString() === userId.toString()) {
            return res.status(400).json({
                message: "As the team leader, you cannot leave the team. You can delete the team instead.",
                isError: true
            });
        }

        // Remove the member from the team
        team.members = team.members.filter(member => member.toString() !== userId.toString());
        await team.save();

        // Delete attendance record for the member who left
        await AttendanceModel.deleteOne({
            studentId: userId,
            teamId: teamId
        });

        res.status(200).json({ message: "You have left the team successfully", isError: false });
    } catch (error) {
        console.error("Error leaving team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Join a team using share ID
exports.joinTeam = async (req, res) => {
    try {
        const { shareId } = req.body;
        const userId = req.user._id; // Use _id from the user object

        if (!shareId) {
            return res.status(400).json({ message: "Team code is required", isError: true });
        }

        const team = await TeamModel.findOne({ shareId });
        if (!team) {
            return res.status(404).json({ message: "Team not found with this code", isError: true });
        }

        // Check if user is already in another team for this event
        const userExistingTeam = await TeamModel.findOne({
            eventId: team.eventId,
            members: userId
        });

        if (userExistingTeam) {
            if (userExistingTeam._id.toString() === team._id.toString()) {
                return res.status(400).json({ message: "You are already a member of this team", isError: true });
            } else {
                return res.status(400).json({ message: "You are already a member of another team for this event", isError: true });
            }
        }

        // Check team size limit
        const event = await EventModel.findById(team.eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found", isError: true });
        }

        if (team.members.length >= event.maxMember) {
            return res.status(400).json({ message: "Team is already full", isError: true });
        }

        // Add user to the team
        team.members.push(userId);
        await team.save();

        // Create attendance record for the new team member with default "absent" status
        const memberAttendance = new AttendanceModel({
            studentId: userId,
            eventId: team.eventId,
            teamId: team._id,
            status: 'absent',
            pointsGiven: 0
        });

        await memberAttendance.save();

        // Populate the team before returning
        const populatedTeam = await TeamModel.findById(team._id)
            .populate("leader")
            .populate("members");

        res.status(200).json({ message: "Successfully joined the team", team: populatedTeam, isError: false });
    } catch (error) {
        console.error("Error joining team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const { teamId } = req.params;
        console.log("Fetching attendance for team:", teamId);
        // First find the team
        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }
        // Fetch attendance records for the team
        const attendanceRecords = await AttendanceModel.find({ teamId })
            .populate('studentId', 'fullName email photo')
            .populate('eventId', 'eventName date venue photo maxMember')
            .populate('teamId', 'teamName shareId');
        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ message: "No attendance records found for this team", isError: true });
        }
        res.status(200).json({
            message: "Attendance records fetched successfully",
            attendanceRecords,
            isError: false
        });
    } catch (error) {
        console.error("Error fetching attendance records:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};


// Mark attendance for team members - Only coordinators allowed
exports.markAttendance = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { attendance, teamComment,teamPoints} = req.body; // Array of { memberId, status, pointsGiven, comment }
        const userId = req.user.id;

        // First find the team
        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        // Get the event to check coordinator permissions
        const event = await EventModel.findById(team.eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found", isError: true });
        }

        // Only event coordinators can mark attendance
        const isCoordinator = event.clubIds.some(clubId =>
            clubId.toString() === userId ||
            (typeof clubId === 'object' && clubId._id && clubId._id.toString() === userId)
        );

        if (!isCoordinator) {
            return res.status(403).json({ message: "Only coordinators can mark attendance", isError: true });
        }

        // Update team comment if provided
        if (teamComment !== undefined) {
            team.comment = teamComment;
            await team.save();
        }
        // Update team points if provided
        if (typeof teamPoints === "number") {
            team.teamPoints = teamPoints; // ensures >= 0
            await team.save();
        }

        const attendanceRecords = [];
        for (const { memberId, status, pointsGiven, comment } of attendance) {
            const record = await AttendanceModel.findOneAndUpdate(
                { studentId: memberId, eventId: team.eventId, teamId },
                { status, pointsGiven, comment },
                { upsert: true, new: true }
            );
            attendanceRecords.push(record);

            if (status === "present" && pointsGiven > 0) {
                await team.save();
                const user = await User.findById(memberId);
                if (user) {
                    user.TotalPoints = (user.TotalPoints || 0) + pointsGiven;
                    await user.save();
                }
            }
        }
        

        res.status(200).json({ message: "Attendance marked successfully", attendanceRecords, isError: false });
    } catch (error) {
        console.error("Error marking attendance:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Update attendance for a team - Coordinators only
exports.updateAttendance = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { attendance, teamComment } = req.body; // Array of { memberId, status, pointsGiven, comment }
        const userId = req.user.id;

        // First find the team
        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        // Get the event to check coordinator permissions
        const event = await EventModel.findById(team.eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found", isError: true });
        }

        // Only event coordinators can update attendance
        const isCoordinator = event.clubIds.some(clubId =>
            clubId.toString() === userId ||
            (typeof clubId === 'object' && clubId._id && clubId._id.toString() === userId)
        );

        if (!isCoordinator) {
            return res.status(403).json({ message: "Only coordinators can update attendance", isError: true });
        }

        // Update team comment if provided
        if (teamComment !== undefined) {
            team.comment = teamComment;
            await team.save();
        }

        const attendanceRecords = [];
        for (const { memberId, status, pointsGiven, comment } of attendance) {
            // Find existing record to calculate point difference
            const existingRecord = await AttendanceModel.findOne({
                studentId: memberId,
                eventId: team.eventId,
                teamId
            });

            // Calculate point difference for updating user total
            const oldPoints = existingRecord && existingRecord.status === 'present'
                ? existingRecord.pointsGiven || 0
                : 0;

            const newPoints = status === 'present' ? pointsGiven : 0;
            const pointDifference = newPoints - oldPoints;

            // Update attendance record
            const record = await AttendanceModel.findOneAndUpdate(
                { studentId: memberId, eventId: team.eventId, teamId },
                { status, pointsGiven, comment },
                { upsert: true, new: true }
            );

            attendanceRecords.push(record);

            // Update user's total points if there was a change
            if (pointDifference !== 0) {
                const user = await User.findById(memberId);
                if (user) {
                    user.TotalPoints = Math.max(0, (user.TotalPoints || 0) + pointDifference);
                    await user.save();
                }
            }
        }

        res.status(200).json({ message: "Attendance updated successfully", attendanceRecords, isError: false });
    } catch (error) {
        console.error("Error updating attendance:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
}

// Delete a team - Allowed for team leader or coordinators
exports.deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.id;

        // First find the team
        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found", isError: true });
        }

        // Get the event to check coordinator permissions
        const event = await EventModel.findById(team.eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found", isError: true });
        }

        // Check if user is team leader or event coordinator
        const isTeamLeader = team.leader.toString() === userId;
        const isCoordinator = event.clubIds.some(clubId =>
            clubId.toString() === userId ||
            (typeof clubId === 'object' && clubId._id && clubId._id.toString() === userId)
        );

        if (!isTeamLeader && !isCoordinator) {
            return res.status(403).json({
                message: "Only the team leader or event coordinators can delete the team",
                isError: true
            });
        }

        // Delete all attendance records for the team
        const attendancesToDelete = await AttendanceModel.find({ teamId });
        for (const attendance of attendancesToDelete) {
            if (attendance.status === "present" && attendance.pointsGiven > 0) {
                const user = await User.findById(attendance.studentId);
                if (user) {
                    user.TotalPoints = Math.max(0, (user.TotalPoints || 0) - attendance.pointsGiven);
                    await user.save();
                }
            }
        }

        await AttendanceModel.deleteMany({ teamId });

        // Delete the team itself
        await TeamModel.findByIdAndDelete(teamId);

        res.status(200).json({ message: "Team deleted successfully", isError: false });
    } catch (error) {
        console.error("Error deleting team:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Get teams for an event or by share ID
exports.getTeams = async (req, res) => {
    try {
        const { eventId, userId } = req.query;

        let filter = {};
        if (eventId) filter.eventId = eventId;
        if (userId) filter.members = userId;

        const teams = await TeamModel.find(filter)
            .populate('eventId', 'eventName date venue photo maxMember')
            .populate('leader', 'fullName email photo')
            .populate('members', 'fullName email photo');

        res.status(200).json({ teams, isError: false });
    } catch (error) {
        console.error("Error fetching teams:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Get user participation in team events
exports.getUserTeamParticipation = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required", isError: true });
        }

        // Find all teams where the user is a member
        const userTeams = await TeamModel.find({ members: userId })
            .populate('eventId', 'eventName date venue photo maxMember')
            .populate('leader', 'fullName email photo')
            .populate('members', 'fullName email photo');

        res.status(200).json({
            teams: userTeams,
            isError: false,
            message: "User team participation fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching user team participation:", error.message);
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

        // Check if we're looking for a single team or multiple teams
        if (teamId || shareId) {
            // Single team lookup
            const team = await TeamModel.findOne(filter)
                .populate("eventId")
                .populate("leader")
                .populate("members");

            if (!team) {
                return res.status(404).json({ message: "Team not found", isError: true });
            }

            // Add a flag indicating if the team is full
            const event = await EventModel.findById(team.eventId);
            const isTeamFull = team.members.length >= event.maxMember;

            res.status(200).json({
                message: "Team fetched successfully",
                team: { ...team.toObject(), isTeamFull },
                isError: false
            });
        } else {
            // Multiple teams lookup
            const teams = await TeamModel.find(filter)
                .populate("eventId")
                .populate("leader")
                .populate("members");

            // Add information about whether each team is full
            const teamsWithFillStatus = await Promise.all(teams.map(async (team) => {
                const event = await EventModel.findById(team.eventId);
                const isTeamFull = team.members.length >= event.maxMember;
                return { ...team.toObject(), isTeamFull };
            }));

            res.status(200).json({
                message: "Teams fetched successfully",
                teams: teamsWithFillStatus,
                isError: false
            });
        }
    } catch (error) {
        console.error("Error fetching team(s):", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};


