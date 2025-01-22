const {EventModel} = require("../model/ClubModel");

exports.createEvent = async (req, res) => {
    try {
        const {clubIds, eventName, description, venue, duration, maxPoints, date, status,totalWinner} = req.body;

        if (!Array.isArray(clubIds) || clubIds.length === 0) {
            return res.status(400).json({message: "At least one club is required", isError: true});
        }

        if (!eventName || !venue || !duration || !maxPoints || !date) {
            return res.status(400).json({message: "Missing required fields", isError: true});
        }

        const existingEvent = await EventModel.findOne({eventName, date});
        if (existingEvent) {
            return res.status(400).json({message: "Event with the same name and date already exists", isError: true});
        }

        const newEvent = new EventModel({
            clubIds,
            eventName,
            description: description || null,
            venue,
            duration,
            maxPoints,
            date: new Date(date),
            status: status || null,
            totalWinner,
        });

        await newEvent.save();
        res.status(201).json({message: "Event created successfully", event: newEvent, isError: false});
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error", isError: true});
    }
};

exports.getEvents = async (req, res) => {
    try {
        const {clubId, search, limit, skip, id, dateAfter, dateBefore, status} = req.query;

        if (id) {
            const event = await EventModel.findById(id).populate("clubIds winners");
            if (!event) return res.status(404).json({message: "Event not found", isError: true});
            return res.status(200).json({message: "Event fetched successfully", event, isError: false});
        }

        let filter = {};
        if (clubId) filter.clubIds = clubId;
        if (search) filter.eventName = {$regex: search, $options: "i"};
        if (dateAfter) {
            filter.date = {$gte: new Date(dateAfter)};
        }
        if (dateBefore) {
            filter.date = {...(filter.date || {}), $lte: new Date(dateBefore)};
        }
        if (status) {
            if (statusValues) {
                filter.status = {$in: status.split(',')};
            }
        }

        const events = await EventModel.find(filter)
            .populate("clubIds winners")
            .limit(limit ? parseInt(limit) : 30)
            .skip(skip ? parseInt(skip) : 0);

        res.status(200).json({message: "Events fetched successfully", events, isError: false});
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error", isError: true});
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const {id} = req.query;
        const updates = req.body;

        const updatedEvent = await EventModel.findByIdAndUpdate(id, updates, {new: true}).populate("clubIds");
        if (!updatedEvent) return res.status(404).json({message: "Event not found", isError: true});

        res.status(200).json({message: "Event updated successfully", event: updatedEvent, isError: false});
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error", isError: true});
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const {id} = req.query;

        const deletedEvent = await EventModel.findByIdAndDelete(id);
        if (!deletedEvent) return res.status(404).json({message: "Event not found", isError: true});

        res.status(200).json({message: "Event deleted successfully", isError: false});
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({message: "Internal Server Error", isError: true});
    }
};
exports.getAllEvents = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Event IDs are required in an array", isError: true });
        }

        // Fetch the event details for the given array of IDs
        const events = await EventModel.find({ _id: { $in: ids } }).populate("clubIds winners");

        if (!events || events.length === 0) {
            return res.status(404).json({ message: "No events found for the given IDs", isError: true });
        }

        res.status(200).json({
            message: "Events fetched successfully",
            events,
            isError: false
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", isError: true });
    }
};
