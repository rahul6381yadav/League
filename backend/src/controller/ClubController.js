const {ClubModel} = require("../model/clubModel");

// Create a new club
exports.createClub = async (req, res) => {
    try {
        const club = await ClubModel.findOne({ name: req.body.name });
        if (club) {
            return res.status(400).json({ message: "Club with the given name already exists", isError: true });
        }
        const newClub = new ClubModel(req.body);
        await newClub.save();
        res.status(201).json({ message: "Club created successfully", club: newClub, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

exports.getClubs = async (req, res) => {
    try {
        const { search, ratingMin, ratingMax, limit, skip, coordinatorId, userId, id } = req.query;

        if (id) {
            const club = await ClubModel.findById(id).populate("members studentMembers");
            if (!club) return res.status(404).json({ message: "Club not found", isError: true, club: null });
            return res.status(200).json({ club: club, isError: false, message: "Club fetched successfully"});
        }

        let filter = {};
        if (search) {
            filter.name = { $regex: search, $options: "i" }; 
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
        const updates = req.body;
        updates.lastUpdated = Date.now();

        const updatedClub = await ClubModel.findByIdAndUpdate(id, updates, { new: true }).populate("members studentMembers");
        if (!updatedClub) return res.status(404).json({ message: "Club not found", isError: true, club: null });
        res.status(200).json({ message: "Club updated successfully", club: updatedClub, isError: false });
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
