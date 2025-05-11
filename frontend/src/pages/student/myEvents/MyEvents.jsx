import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../clubs/events/components/Pagination';
import EventFilters from '../clubs/events/components/EventFilter';
import EventCard from '../clubs/events/components/EventCard';
import { jwtDecode } from "jwt-decode";
import { backendUrl } from '../../../utils/routes';
import EventCardSkeleton from '../clubs/events/components/EventCardSkeleton';

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
    const [activeTab, setActiveTab] = useState('all');
    const token = localStorage.getItem('jwtToken');

    const fetchMyEvents = async () => {
        try {
            // Fetch attendance records for the current student
            const response = await axios.get(
                `${backendUrl}/api/v1/club/attendance`,
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
                    `${backendUrl}/api/v1/club/all-events`,
                    { "ids": eventIds },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                if (eventResponse.data.events && eventResponse.status === 200) {
                    // Sort events by date in descending order
                    const sortedEvents = eventResponse.data.events.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setMyEvents(sortedEvents);
                    setFilteredEvents(sortedEvents);
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
        const now = new Date();
        let filtered = myEvents.filter(event => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < now;

            // Apply tab filter first
            if (activeTab === 'upcoming' && isPast) return false;
            if (activeTab === 'past' && !isPast) return false;

            // Then apply search and date filters
            const matchesSearch = filters.search
                ? event.eventName.toLowerCase().includes(filters.search.toLowerCase())
                : true;

            const matchesDate = filters.date
                ? new Date(event.date).toISOString().split('T')[0] === filters.date
                : true;

            return matchesSearch && matchesDate;
        });

        setFilteredEvents(filtered);
    }, [filters, myEvents, activeTab]);

    const filteredEventsPaginated = filteredEvents.slice(pagination.skip, pagination.skip + pagination.limit);

    // Animated background gradient styles
    const gradientStyle = {
        backgroundSize: '300% 300%',
        animation: 'gradient 15s ease infinite',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 py-8 px-4" style={gradientStyle}>
            <div className="max-w-7xl mx-auto">
                {/* Header with animated text */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-300 pb-2 animate-gradient-text">
                        My Events
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                        View and manage all events you've signed up for
                    </p>
                </div>

                {/* Tab navigation */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'all'
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}
                        >
                            All Events
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'upcoming'
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'past'
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}
                        >
                            Past Events
                        </button>
                    </div>
                </div>

                {/* Filter section with glassy effect */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg mb-8 p-4 border border-indigo-100 dark:border-violet-900">
                    <EventFilters setFilters={setFilters} />
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="relative overflow-hidden rounded-xl">
                                <div className="absolute inset-0 animate-pulse-border rounded-xl"></div>
                                <EventCardSkeleton />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Event count and results summary */}
                        <div className="flex justify-between items-center mb-4 px-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredEvents.length === 0 ? (
                                    ""
                                ) : (
                                    <>Showing <span className="font-medium text-indigo-600 dark:text-indigo-400">{Math.min(pagination.skip + 1, filteredEvents.length)}-{Math.min(pagination.skip + pagination.limit, filteredEvents.length)}</span> of <span className="font-medium text-indigo-600 dark:text-indigo-400">{filteredEvents.length}</span> events</>
                                )}
                            </p>
                            <div className="flex items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-500 mr-2">Sort by:</span>
                                    <select className="text-xs text-gray-500 dark:text-gray-500 bg-white/80 dark:bg-gray-700/80 border border-indigo-200 dark:border-violet-800 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="recent">Date (Newest)</option>
                                    <option value="oldest">Date (Oldest)</option>
                                </select>
                            </div>
                        </div>

                        {/* Events grid with animated borders */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                            {filteredEventsPaginated.length > 0 ? (
                                filteredEventsPaginated.map((event) => (
                                    <div key={event._id} className="relative rounded-xl overflow-hidden group">
                                        {/* Animated border */}
                                        <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 animate-spin-slow"></div>
                                        <div className="absolute inset-[1px] rounded-xl bg-white dark:bg-gray-800 z-0"></div>

                                        {/* Card content */}
                                        <div className="relative z-10">
                                            <EventCard
                                                event={event}
                                                className="bg-transparent border-0 rounded-lg p-4 h-full"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                    <div className="text-indigo-400 dark:text-indigo-300 mb-4">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">No events found</p>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-center max-w-sm">
                                        {activeTab === 'upcoming'
                                            ? "You don't have any upcoming events. Explore more events to join!"
                                            : activeTab === 'past'
                                                ? "No past events found in your history."
                                                : "No events match your current filters. Try adjusting your search criteria."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Pagination with updated styling */}
                {!loading && filteredEvents.length > pagination.limit && (
                    <div className="mt-10">
                        <Pagination
                            pagination={pagination}
                            setPagination={setPagination}
                            total={filteredEvents.length}
                            buttonClass="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                            containerClass="flex justify-center items-center gap-2"
                        />
                    </div>
                )}
            </div>

            {/* Add CSS for animations */}
            <style jsx>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .animate-spin-slow {
                    animation: spin-slow 4s linear infinite;
                }
                
                .animate-pulse-border {
                    animation: pulse-border 1.5s infinite;
                    background: linear-gradient(90deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(124, 58, 237, 0.3) 100%);
                }
                
                @keyframes pulse-border {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                .animate-gradient-text {
                    background-size: 200% auto;
                    animation: gradient-shift 4s ease infinite;
                }
                
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default MyEvents;
