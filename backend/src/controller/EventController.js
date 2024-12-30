const {EventModel} = require("../model/ClubModel");


exports.createEvent = async (req, res) => {
    try {
        const { clubId, eventName, description, vanue, duration, maxPoints, date } = req.body;

        const newEvent = new EventModel({
            clubId,
            eventName,
            description,
            vanue,
            duration,
            maxPoints,
            date,
        });

        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Get events with optional filters
exports.getEvents = async (req, res) => {
    try {
        const { clubId, search, limit, skip, id } = req.query;

        if (id) {
            const event = await EventModel.findById(id).populate("clubId");
            if (!event) return res.status(404).json({ message: "Event not found", isError: true, event: null });
            return res.status(200).json({ event, isError: false, message: "Event fetched successfully" });
        }

        let filter = {};
        if (clubId) filter.clubId = clubId;
        if (search) filter.eventName = { $regex: search, $options: "i" };

        const events = await EventModel.find(filter)
            .populate("clubId")
            .limit(limit ? parseInt(limit) : 30)
            .skip(skip ? parseInt(skip) : 0);

        res.status(200).json({ message: "Events fetched successfully", events, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.query;
        const updates = req.body;

        const updatedEvent = await EventModel.findByIdAndUpdate(id, updates, { new: true }).populate("clubId");
        if (!updatedEvent) return res.status(404).json({ message: "Event not found", isError: true });

        res.status(200).json({ message: "Event updated successfully", event: updatedEvent, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.query;

        const deletedEvent = await EventModel.findByIdAndDelete(id);
        if (!deletedEvent) return res.status(404).json({ message: "Event not found", isError: true });

        res.status(200).json({ message: "Event deleted successfully", isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};
