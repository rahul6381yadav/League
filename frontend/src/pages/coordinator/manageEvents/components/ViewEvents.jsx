import React, { useEffect, useState } from "react";
import axios from 'axios';
import EventCard from '../../../student/clubs/events/components/EventCard';
import Pagination from '../../../student/clubs/events/components/Pagination';
import EventFilters from '../../../student/clubs/events/components/EventFilter';
import { backendUrl } from "../../../../utils/routes";
import { jwtDecode } from "jwt-decode";

function ViewEvents(props) {
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ limit: 6, skip: 0 });
    const [filters, setFilters] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null); // Track the selected event
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Control the popup visibility
    const token = localStorage.getItem("jwtToken");
    let decodedToken = null;
    if (token) {
        try {
            decodedToken = jwtDecode(token); // Decode JWT token
        } catch (error) {
            console.error("Error decoding JWT token:", error.message);
        }
    }

    const fetchAllEvents = async () => {
        try {
            const response = await axios.get(
                `${backendUrl}/api/v1/club/events?clubId=${props.props.primaryClubId}`,
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
    }, [props.props.primaryClubId, pagination]);

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

    // Check if we should show the empty state
    const shouldShowEmptyState = props.showEmptyState ?
        props.showEmptyState(allEvents) :
        allEvents.length === 0;

    if (loading) {
        return (
            <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                        Events
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 h-64 animate-pulse">
                            <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-700 mb-4"></div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-4"></div>
                            <div className="flex items-center mb-4">
                                <div className="w-4 h-4 bg-indigo-200 dark:bg-indigo-700 rounded-full mr-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6 mb-6"></div>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-md mr-3"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4"></div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-md mr-3"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-2/5"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (shouldShowEmptyState) {
        return props.emptyComponent || (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <svg className="w-12 h-12 text-indigo-400 dark:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Events Found</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">There are no events available for this club right now.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Page header with gradient text */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                    Events
                </h2>

                <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium text-indigo-600 dark:text-indigo-400">{filteredEvents.length}</span> events
                    </span>
                </div>
            </div>

            {/* Filters section */}
            <div className="mb-8">
                <EventFilters setFilters={setFilters} />
            </div>

            {/* Events grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEventsPaginated.length > 0 ? (
                    filteredEventsPaginated.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
                            onTitleClick={handleTitleClick}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-indigo-100 dark:border-violet-900/30 text-center">
                        <svg className="w-12 h-12 mx-auto text-indigo-300 dark:text-indigo-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400">
                            No events match your current filters
                        </p>
                        <button
                            onClick={() => setFilters({})}
                            className="mt-4 px-4 py-2 rounded-md text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredEvents.length > pagination.limit && (
                <div className="mt-4">
                    <Pagination
                        pagination={pagination}
                        setPagination={setPagination}
                        total={filteredEvents.length}
                        buttonClass="px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-indigo-200 dark:border-violet-900/30 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-violet-900/10 transition-colors"
                        containerClass="flex justify-center gap-2"
                    />
                </div>
            )}

            {/* Sign-up Popup - with improved styling */}
            {isPopupOpen && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-indigo-100 dark:border-violet-900/30 transform transition-all animate-fade-in">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
                                {selectedEvent.eventName}
                            </h2>
                            <button onClick={handleClosePopup} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6 space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                            <p className="text-gray-600 dark:text-gray-400 italic">
                                {selectedEvent.description || 'No description available'}
                            </p>

                            <div className="pt-4 space-y-2">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <span>{new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>

                                <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mr-3">
                                        <svg className="w-3.5 h-3.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                    </div>
                                    <span>{selectedEvent.venue || 'Location not specified'}</span>
                                </div>

                                <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                                        <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <span>{selectedEvent.duration || 'Duration not specified'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={handleClosePopup}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-md shadow-sm transition-colors"
                                onClick={handleSignup}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add keyframes for animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
`;
document.head.appendChild(styleSheet);

export default ViewEvents;
