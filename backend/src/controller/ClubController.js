const {ClubModel} = require("../model/ClubModel");

exports.getClubs = async (req, res) => {
    try {
        const { search, ratingMin, ratingMax, limit, skip, coordinatorId, userId, id , email } = req.query;

        if (id) {
            const club = await ClubModel.findById(id).populate("coordinator1 coordinator2 members studentMembers");
            if (!club) return res.status(404).json({ message: "Club not found", isError: true, club: null });
            return res.status(200).json({ club: club, isError: false, message: "Club fetched successfully"});
        }

        let filter = {};
        if(search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (ratingMin || ratingMax) {
            filter.overallRating = {};
            if (ratingMin) filter.overallRating.$gte = Number(ratingMin);
            if (ratingMax) filter.overallRating.$lte = Number(ratingMax);
        }
        if (userId) {
            filter.$or = [
                { studentMembers: userId }
            ];
        }
        if (coordinatorId) {
            filter.members = coordinatorId;
        }
        if (email) {
            filter.email = email;
        }
        const clubs = await ClubModel.find(filter)
            .limit(limit ? parseInt(limit) : 30)
            .skip(skip ? parseInt(skip) : 0);

        res.status(200).json({ message: "Clubs fetched Successfully", clubs: clubs, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ isError: true, message: "Internal Server Error", clubs: [] });
    }
};

// Update a club by ID
exports.updateClub = async (req, res) => {
    try {
        const { id } = req.query;
        const { memberIds, studentMemberIds,removeMemberIds, removeStudentMemberIds, ...updates } = req.body; 
        updates.lastUpdated = Date.now();

        const club = await ClubModel.findById(id);
        if (!club) return res.status(404).json({ message: "Club not found", isError: true, club: null });
        if (memberIds && Array.isArray(memberIds)) {
            club.members = [...new Set([...club.members, ...memberIds])]; // Ensure no duplicates
        }
        // Add new student members to the club
        if (studentMemberIds && Array.isArray(studentMemberIds)) {
            club.studentMembers = [...new Set([...club.studentMembers, ...studentMemberIds])]; // Ensure no duplicates
        }

        // Remove members from the club
        if (removeMemberIds && Array.isArray(removeMemberIds)) {
            club.members = club.members.filter(member => !removeMemberIds.includes(String(member._id)));
        }

        // Remove student members from the club
        if (removeStudentMemberIds && Array.isArray(removeStudentMemberIds)) {
            club.studentMembers = club.studentMembers.filter(studentId => !removeStudentMemberIds.includes(studentId)); // Remove specified student members
        }

        Object.assign(club, updates);

        // Save the updated club
        const updatedClub = await club.save();
        const populatedClub = await updatedClub.populate("coordinator1 coordinator2 members studentMembers");
        res.status(200).json({ message: "Club updated successfully", club: populatedClub, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true, club: null });
    }
};

// Delete a club by ID
exports.deleteClub = async (req, res) => {
    try {
        const { id } = req.query;
        const deletedClub = await ClubModel.findByIdAndDelete(id);
        if (!deletedClub) return res.status(404).json({ message: "Club not found" });
        res.status(200).json({ message: "Club deleted successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
