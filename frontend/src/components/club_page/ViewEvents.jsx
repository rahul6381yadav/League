import React, { useEffect, useState } from "react";

function ViewEvents(props) {
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const token = localStorage.getItem("authToken");

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter events based on the search query
        const filtered = allEvents.filter(
            (event) =>
                event.eventName.toLowerCase().includes(query) ||
                event.description.toLowerCase().includes(query)
        );
        setFilteredEvents(filtered);
    };

    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                const response = await fetch(
                    `http://192.168.11.8:4000/api/v1/club/events?clubId=${props.primaryClubId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await response.json();
                setAllEvents(data.events);
                setFilteredEvents(data.events); // Initially, display all events
            } catch (err) {
                console.error("Error fetching events:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllEvents();
    }, [props.primaryClubId]);

    if (loading) {
        return <div>Loading events...</div>;
    }

    if (allEvents.length === 0) {
        return <div>No events available.</div>;
    }

    return (
        <div className="p-4 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4 text-black">Club Events</h1>

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search events..."
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Events List */}
            <div className="space-y-6">
                {filteredEvents.map((event) => (
                    <div
                        key={event._id}
                        className="bg-white shadow-lg text-black rounded-lg p-6"
                    >
                        <h2 className="text-xl font-semibold">{event.eventName}</h2>
                        <p className="text-gray-600 mt-2">{event.description}</p>
                        <p className="mt-2 text-sm text-gray-500">
                            <strong>Venue:</strong> {event.vanue} | <strong>Duration:</strong>{" "}
                            {event.duration}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            <strong>Max Points:</strong> {event.maxPoints}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            <strong>Participation counts:</strong> {event.participantsCount}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                        </p>
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">Collaborating Clubs:</h3>
                            <div className="flex flex-wrap gap-4 mt-2">
                                {event.clubIds.map((club) => (
                                    <div
                                        key={club._id}
                                        className="flex items-center space-x-3"
                                    >
                                        <img
                                            src={club.image}
                                            alt={club.name}
                                            className="w-12 h-12 rounded-full border border-gray-300"
                                        />
                                        <div>
                                            <h4 className="font-medium">{club.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                {club.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ViewEvents;
