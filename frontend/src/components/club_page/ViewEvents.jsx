import React, {useEffect, useState} from "react";
import axios from 'axios';
import EventCard from '../manageEvents/EventCard';
import Pagination from '../manageEvents/Pagination';
import EventFilters from '../manageEvents/EventFilter';

function ViewEvents(props) {
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({limit: 6, skip: 0});
    const [filters, setFilters] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null); // Track the selected event
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Control the popup visibility
    const token = localStorage.getItem("jwtToken");


    const fetchAllEvents = async () => {
        try {
            const response = await axios.get(
                `http://localhost:4000/api/v1/club/events?clubId=${props.primaryClubId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );
            setAllEvents(response.data.events);
            setFilteredEvents(response.data.events);
        } catch (err) {
            console.error("Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllEvents();
    }, [props.primaryClubId, pagination]);

    useEffect(() => {
        const filtered = allEvents.filter(event => {
            const matchesSearch = filters.search
                ? event.eventName.toLowerCase().includes(filters.search.toLowerCase())
                : true;

            const matchesDate = filters.date
                ? new Date(event.date).toISOString().split('T')[0] === filters.date
                : true;

            return matchesSearch && matchesDate;
        });
        setFilteredEvents(filtered);
    }, [filters, allEvents]);

    const filteredEventsPaginated = filteredEvents.slice(pagination.skip, pagination.skip + pagination.limit);

    // Handle the title click to open the popup
    const handleTitleClick = (event) => {
        setSelectedEvent(event);
        setIsPopupOpen(true);
    };

    const handleSignup = () => {
        // Implement sign-up logic here
        console.log(`Signed up for event: ${selectedEvent.eventName}`);
        setIsPopupOpen(false); // Close popup after signup
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false); // Close the popup without signing up
    };

    if (loading) {
        return <div>Loading events...</div>;
    }

    if (allEvents.length === 0) {
        return <div className="text-black dark:text-white">No events available.</div>;
    }

    return (
        <div className="text-gray-900 min-h-screen flex flex-col w-full">
            <div className="p-4 w-full flex-grow">
                <h1 className="text-3xl font-bold text-gray dark:text-white text-center mb-4">Club Events</h1>

                <EventFilters setFilters={setFilters}/>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {filteredEventsPaginated.length > 0 ? (
                        filteredEventsPaginated.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                onTitleClick={handleTitleClick} // Pass the click handler to EventCard
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-800 font-semibold dark:text-white">
                            No events found for the selected filters.
                        </p>
                    )}
                </div>

                <Pagination pagination={pagination} setPagination={setPagination}/>
            </div>

            {/* Sign-up Popup */}
            {isPopupOpen && selectedEvent && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-xl font-semibold mb-4">Sign up for {selectedEvent.eventName}?</h2>

                        <div className="mb-4">
                            <p><strong>Description:</strong> {selectedEvent.description || 'No description available'}
                            </p>
                            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                            <p><strong>Venue:</strong> {selectedEvent.vanue}</p>
                            <p><strong>Duration:</strong> {selectedEvent.duration}</p>
                            <p><strong>Participants:</strong> {selectedEvent.participantsCount || 0}</p>
                        </div>

                        <div className="flex justify-between">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handleSignup}
                            >
                                Yes
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-400 text-white rounded"
                                onClick={handleClosePopup}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewEvents;
