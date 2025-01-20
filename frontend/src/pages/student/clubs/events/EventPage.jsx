import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventCard from './components/EventCard';
import EventFilters from './components/EventFilter';
import Pagination from './components/Pagination';
import { FaPlus } from 'react-icons/fa';
import CreateEvents from '../../../coordinator/manageEvents/CreateEvent';

const EventPage = () => {
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({ limit: 6, skip: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [primaryClubId, setPrimaryClubId] = useState('');
    const [primaryClubName, setPrimaryClubName] = useState('');
    const [currentEvent, setCurrentEvent] = useState(null);
    const [clubDetails, setClubDetails] = useState([]);
    const token = localStorage.getItem("jwtToken");
    const email = localStorage.getItem('emailCont');

    const fetchClubDetails = async () => {
        try {
            if (!token) {
                console.error('No auth token found. Please log in.');
                return;
            }
            const response = await fetch(`http://localhost:4000/api/v1/club?email=${email}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();

            if (response.ok) {
                setClubDetails(result.clubs);
                setPrimaryClubId(result.clubs[0]._id);
                setPrimaryClubName(result.clubs[0].name);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                console.error('No auth token found. Please log in.');
                return;
            }
            const { limit, skip } = pagination;
            const response = await axios.get('http://localhost:4000/api/v1/club/events', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { limit, skip },
            });
            if (response.data && response.data.events) {
                setEvents(response.data.events);
            }
        } catch (err) {
            console.error('Error fetching events:', err.response || err.message);
        }
    };

    useEffect(() => {
        fetchClubDetails();
    }, [])

    useEffect(() => {
        fetchEvents();
    }, [pagination]);

    const filteredEvents = events.filter(event => {
        const matchesSearch = filters.search
            ? event.eventName.toLowerCase().includes(filters.search.toLowerCase())
            : true;

        const matchesDate = filters.date
            ? new Date(event.date).toISOString().split('T')[0] === filters.date
            : true;

        return matchesSearch && matchesDate;
    });

    const handleDeleteEvent = async (eventId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            await axios.delete(`http://localhost:4000/api/v1/club/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchEvents();
        } catch (err) {
            console.error('Error deleting event:', err.response || err.message);
        }
    };

    const handleEditEvent = (event) => {
        setCurrentEvent(event);
        setIsModalOpen(true);
    };

    return (
        <div className="h-screen bg-mirage-50 dark:bg-mirage-800 flex flex-col">
            <div className="flex-1 container mx-auto p-4">
                <h1 className="text-3xl font-bold text-mirage-900 dark:text-mirage-50 text-center mb-4">ALL EVENTS</h1>
                <EventFilters setFilters={setFilters} />
                <button
                    onClick={() => {
                        setCurrentEvent(null);
                        setIsModalOpen(true);
                    }}
                    className="mb-4 p-2 bg-mirage-600 text-white rounded flex items-center space-x-2 shadow-md hover:bg-mirage-500 transition"
                >
                    <FaPlus />
                    <span>Create Event</span>
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.slice(pagination.skip, pagination.skip + pagination.limit).map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onEdit={handleEditEvent}
                                onDelete={handleDeleteEvent}
                            />
                        ))
                    ) : (
                        <p className="text-center text-mirage-800 font-semibold dark:text-mirage-50">
                            No events found for the selected filters.
                        </p>
                    )}
                </div>

                <Pagination pagination={pagination} setPagination={setPagination} />
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Background Overlay */}
                    <div
                        className="bg-black opacity-50 absolute inset-0"
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    {/* Modal Container */}
                    <div
                        className="bg-mirage-50 dark:bg-mirage-800 rounded-lg shadow-lg z-10 p-3 w-3/4 max-w-4xl h-auto max-h-[90vh] overflow-y-auto"
                    >
                        <CreateEvents
                            primaryClubId={primaryClubId}
                            primaryClubName={primaryClubName}
                            currentEvent={currentEvent}
                            onClose={() => {
                                setIsModalOpen(false);
                                setCurrentEvent(null);
                                fetchEvents(); // Refresh events after creating/updating
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventPage;
