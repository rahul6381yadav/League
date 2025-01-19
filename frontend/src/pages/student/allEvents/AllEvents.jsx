import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Pagination from '../manageEvents/Pagination';
import EventFilters from '../manageEvents/EventFilter';
import EventCard from '../manageEvents/EventCard';

function AllEvents() {
    const [allEvents, setAllEvents] = useState([]);
    const [pagination, setPagination] = useState({limit: 6, skip: 0});
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const token = localStorage.getItem("jwtToken");
    const fetchAllEvents = async () => {
        try {
            const response = await axios.get(
                `http://localhost:4000/api/v1/club/events`,
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
    }, [pagination]);

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
        </div>
    );
}

export default AllEvents;