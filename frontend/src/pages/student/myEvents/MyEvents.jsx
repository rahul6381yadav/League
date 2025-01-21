import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../clubs/events/components/Pagination';
import EventFilters from '../clubs/events/components/EventFilter';
import EventCard from '../clubs/events/components/EventCard';
import { jwtDecode } from "jwt-decode";

// Ensure token exists before attempting to decode it
const token = localStorage.getItem("jwtToken");
let decodedToken = null;
if (token) {
    try {
        decodedToken = jwtDecode(token); // Decode JWT token
    } catch (error) {
        console.error("Error decoding JWT token:", error.message);
    }
}

const MyEvents = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [pagination, setPagination] = useState({ limit: 6, skip: 0 });
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const token = localStorage.getItem('jwtToken');

    const fetchMyEvents = async () => {
        try {
            // Fetch attendance records for the current student
            const response = await axios.get(
                'http://localhost:4000/api/v1/club/attendance',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        studentId: decodedToken?.userId, // Ensure `decodedToken` is valid
                    },
                }
            );

            const records = Array.isArray(response.data.records) ? response.data.records : [];
            if (records.length > 0) {
                // Extract event IDs as strings
                const eventIds = records.map(record => record.eventId._id.toString()); // Ensure they are strings
                // Send the array of event IDs to the new backend endpoint
                const eventResponse = await axios.post(
                    'http://localhost:4000/api/v1/club/all-events',
                    { "ids": eventIds },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                if (eventResponse.data.events && eventResponse.status === 200) {
                    setMyEvents(eventResponse.data.events);
                    setFilteredEvents(eventResponse.data.events);
                }
            } else {
                // No attendance records
                console.warn("No attendance records found.");
                setMyEvents([]);
                setFilteredEvents([]);
            }
        } catch (error) {
            console.error("Error fetching attendance records:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyEvents();
    }, [pagination]);

    useEffect(() => {
        const filtered = myEvents.filter(event => {
            const matchesSearch = filters.search
                ? event.eventName.toLowerCase().includes(filters.search.toLowerCase())
                : true;

            const matchesDate = filters.date
                ? new Date(event.date).toISOString().split('T')[0] === filters.date
                : true;

            return matchesSearch && matchesDate;
        });
        setFilteredEvents(filtered);
    }, [filters, myEvents]);

    const filteredEventsPaginated = filteredEvents.slice(pagination.skip, pagination.skip + pagination.limit);

    if (loading) {
        return <div className="text-mirage-600 dark:text-mirage-200">Loading events...</div>;
    }

    if (myEvents.length === 0) {
        return <div className="text-mirage-600 dark:text-mirage-200">No events available.</div>;
    }

    return (
        <div className="h-screen w-full flex bg-mirage-50 dark:bg-mirage-900">
            <div className="h-full w-full flex flex-col p-8">
                <h1 className="text-3xl font-bold text-mirage-700 dark:text-mirage-100 mb-6 text-center">My Events</h1>

                <EventFilters setFilters={setFilters} />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEventsPaginated.length > 0 ? (
                        filteredEventsPaginated.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                className="bg-white dark:bg-mirage-800 border border-mirage-300 dark:border-mirage-600 rounded-lg p-4 shadow-md"
                            />
                        ))
                    ) : (
                        <p className="text-center text-mirage-600 dark:text-mirage-400 font-semibold">
                            No events found for the selected filters.
                        </p>
                    )}
                </div>

                <Pagination
                    pagination={pagination}
                    setPagination={setPagination}
                    buttonClass="px-4 py-2 rounded bg-mirage-600 dark:bg-mirage-400 text-white transition-colors hover:bg-mirage-700 dark:hover:bg-mirage-300"
                />
            </div>
        </div>
    );
};

export default MyEvents;
