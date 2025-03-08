import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EventCard from './components/EventCard';
import EventFilters from './components/EventFilter';
import Pagination from './components/Pagination';
import { FaPlus } from 'react-icons/fa';
// decode jwt token
import { jwtDecode } from "jwt-decode";
import { backendUrl } from '../../../../utils/routes';

// Ensure token exists before attempting to decode it
const token = localStorage.getItem("jwtToken");

const EventPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [email, setEmail] = useState('');
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({ limit: 6, skip: 0 });
    const [primaryClubId, setPrimaryClubId] = useState('');
    const [primaryClubName, setPrimaryClubName] = useState('');
    const [clubDetails, setClubDetails] = useState([]);
    const token = localStorage.getItem("jwtToken");
    let decodedToken = null;
    if (token) {
        try {
            decodedToken = jwtDecode(token); // Decode JWT token
        } catch (error) {
            console.error("Error decoding JWT token:", error.message);
        }
    }
    const fetchClubDetails = async () => {
        try {
            if (!token) {
                console.error('No auth token found. Please log in.');
                return;
            }
            const response = await fetch(`${backendUrl}/api/v1/club?email=${email}`, {
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
            if (!token) {
                console.error('No auth token found. Please log in.');
                return;
            }
            const { limit, skip } = pagination;
            const response = await axios.get(`${backendUrl}/api/v1/club/events?clubId=${decodedToken.clubId}`, {
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
    }, []);

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
            await axios.delete(`${backendUrl}/api/v1/club/events/${eventId}`, {
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
        navigate(`/events/edit/${event._id}`, {
            state: {
                event,
                primaryClubId,
                primaryClubName
            }
        });
    };

    const handleCreateEvent = () => {
        navigate('/events/create', {
            state: {
                primaryClubId,
                primaryClubName
            }
        });
    };

    return (
        <div className="h-screen bg-mirage-50 dark:bg-mirage-800 flex flex-col">
            <div className="flex-1 container mx-auto p-4">
                <h1 className="text-3xl font-bold text-mirage-900 dark:text-mirage-50 text-center mb-4">ALL EVENTS</h1>
                <EventFilters setFilters={setFilters} />
                <button
                    onClick={handleCreateEvent}
                    className="mb-4 p-2 bg-mirage-600 text-white rounded flex items-center space-x-2 shadow-md hover:bg-mirage-500 transition"
                >
                    <FaPlus />
                    <span>Create Event</span>
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.slice(pagination.skip, pagination.skip + pagination.limit).map((event) => (
                            <EventCard
                                key={event._id}
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
        </div>
    );
};

export default EventPage;