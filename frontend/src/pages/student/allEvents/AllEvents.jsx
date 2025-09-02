import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../clubs/events/components/Pagination';
import EventFilters from '../clubs/events/components/EventFilter';
import EventCard from '../clubs/events/components/EventCard';
import { backendUrl } from '../../../utils/routes';
import EventCardSkeleton from '../clubs/events/components/EventCardSkeleton';

const AllEvents = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [pagination, setPagination] = useState({ limit: 6, skip: 0 });
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const token = localStorage.getItem('jwtToken');

    const fetchAllEvents = async () => {
        try {
            const response = await axios.get(
                `${backendUrl}/api/v1/club/events`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // i want to fetch all events and set them to allEvents and filteredEvents in sorted order of the date
            const sortedEvents = response.data.events.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAllEvents(sortedEvents);
            setFilteredEvents(sortedEvents);
        } catch (err) {
            console.error('Error fetching events:', err);
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



    // if (allEvents.length === 0) {
    //     return <div className="text-mirage-600 dark:text-mirage-200">No events available.</div>;
    // }

    return (
        <div className="h-screen w-full flex">
            <div className="h-full w-full flex flex-col p-8">
                <h1 className="text-3xl font-bold text-mirage-700 dark:text-mirage-100 mb-6 text-center">All Events</h1>

                <EventFilters setFilters={setFilters} />
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <EventCardSkeleton key={index} />
                        ))}
                    </div>
                ) : (
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
                )}

                <Pagination
                    pagination={pagination}
                    setPagination={setPagination}
                    buttonClass="px-4 py-2 rounded bg-mirage-600 dark:bg-mirage-400 text-white transition-colors hover:bg-mirage-700 dark:hover:bg-mirage-300"
                />
            </div>
        </div>
    );
};

export default AllEvents;
