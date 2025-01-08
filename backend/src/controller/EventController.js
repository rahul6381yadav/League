const {EventModel} = require("../model/ClubModel");

exports.createEvent = async (req, res) => {
    try {
        const { clubIds, eventName, description, vanue, duration, maxPoints, date } = req.body;

        if (!Array.isArray(clubIds) || clubIds.length === 0) {
            return res.status(400).json({ message: "At least one club is required", isError: true });
        }

        if (!eventName || !vanue || !duration || !maxPoints || !date) {
            return res.status(400).json({ message: "Missing required fields", isError: true });
        }

        const existingEvent = await EventModel.findOne({ eventName, date });
        if (existingEvent) {
            return res.status(400).json({ message: "Event with the same name and date already exists", isError: true });
        }

        const newEvent = new EventModel({
            clubIds,
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

exports.getEvents = async (req, res) => {
    try {
        const { clubId, search, limit, skip, id } = req.query;

        if (id) {
            const event = await EventModel.findById(id).populate("clubIds");
            if (!event) return res.status(404).json({ message: "Event not found", isError: true });
            return res.status(200).json({ message: "Event fetched successfully", event, isError: false });
        }

        let filter = {};
        if (clubId) filter.clubIds = clubId;
        if (search) filter.eventName = { $regex: search, $options: "i" };

        const events = await EventModel.find(filter)
            .populate("clubIds")
            .limit(limit ? parseInt(limit) : 30)
            .skip(skip ? parseInt(skip) : 0);

        res.status(200).json({ message: "Events fetched successfully", events, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.query;
        const updates = req.body;

        const updatedEvent = await EventModel.findByIdAndUpdate(id, updates, { new: true }).populate("clubIds");
        if (!updatedEvent) return res.status(404).json({ message: "Event not found", isError: true });

        res.status(200).json({ message: "Event updated successfully", event: updatedEvent, isError: false });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};

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
