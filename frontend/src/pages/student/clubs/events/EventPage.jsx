import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { backendUrl } from '../../../../utils/routes';
import { Loader2, Calendar, Search, PlusCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import _ from 'lodash'; // For debouncing
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaChevronRight } from 'react-icons/fa';

// Update only the EventCard component within EventPage.jsx
const EventCard = ({ event, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const isTeamEvent = event.maxMember > 1;
    const { role } = 'coordinator'; // Assuming useRole is a custom hook to get user role
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleCardClick = () => {
        if (event.maxMember > 1) {
            navigate(`/manage-event/participants/${event._id}`);
        } else {
            navigate(`/events/${event._id}`, { state: { event } });
        }
    };
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-indigo-100 dark:border-violet-900/30 flex flex-col h-full transform hover:-translate-y-1"
        >
            {/* Color accent top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-violet-500"></div>

            {/* Content container */}
            <div className="flex flex-col h-full">
                {/* Event header */}
                <div className="p-5 pb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{event.eventName}</h3>

                    {/* Date and time info */}
                    <div className="flex items-center mb-3 text-sm text-gray-700 dark:text-gray-300">
                        <FaCalendarAlt className="text-indigo-500 dark:text-indigo-400 mr-2" />
                        <span className="font-medium">{formatDate(event.date)}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTime(event.date)}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {event.description || "No description available"}
                    </p>
                </div>

                {/* Details grid */}
                <div className="px-5 grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <div className="w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                            <FaClock className="text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <span>{event.duration}</span>
                    </div>

                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <div className="w-7 h-7 rounded-md bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mr-3">
                            <FaMapMarkerAlt className="text-violet-500 dark:text-violet-400" />
                        </div>
                        <span className="truncate">{event.venue}</span>
                    </div>

                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                            <FaUsers className="text-purple-500 dark:text-purple-400" />
                        </div>
                        <span>{event.participantsCount || 0} participants</span>
                    </div>
                </div>

                {/* Collaborating Clubs Section */}
                {event.clubIds && event.clubIds.length > 0 && (
                    <div className="px-5 mt-3">
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Collaborating with:</h4>
                            <div className="flex flex-wrap gap-1">
                                {event.clubIds.map((club) => (
                                    <div key={club._id} className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                                        {club.image && (
                                            <img
                                                src={club.image}
                                                alt=""
                                                className="w-3 h-3 rounded-full mr-1"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <span className="text-xs truncate max-w-[80px] text-gray-700 dark:text-gray-300">{club.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add team event indicator */}
                {isTeamEvent && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Team Event
                    </div>
                )}

                {/* Call to action */}
                <div className="mt-auto p-4 pt-6">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
                            {role === "coordinator" ? "Manage participants" : "View event details"}
                        </span>
                        <button className="py-1.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm flex items-center transition-colors">
                            {role === "coordinator" ? "Manage" : "View"}
                            <FaChevronRight className="ml-1.5 text-xs" />
                        </button>
                    </div>
                </div>

                {/* Edit and Delete Buttons */}
                <div className="flex justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={(e) => onEdit(e)}
                        className="py-1 px-3 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white text-sm flex items-center transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => onDelete(e)}
                        className="py-1 px-3 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm flex items-center transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Empty state component with improved design
const EmptyState = ({ loading, hasFilters, onCreateEvent }) => (
    <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-white dark:bg-gray-800 bg-opacity-95 text-gray-800 dark:text-white backdrop-filter backdrop-blur-sm p-8 rounded-lg shadow-lg text-center max-w-md">
            {loading ? (
                <>
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
                            <div className="w-12 h-12 border-l-4 border-r-4 border-purple-600 rounded-full animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-indigo-400 mb-2">Loading events</h3>
                    <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your events.</p>
                </>
            ) : (
                <>
                    <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full inline-block mb-4">
                        <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                        {hasFilters ? 'No matching events found' : 'No events found'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {hasFilters
                            ? 'Try adjusting your search filters or clear them to see all events.'
                            : 'Get started by creating your first event.'}
                    </p>
                    {!hasFilters && (
                        <button
                            onClick={onCreateEvent}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg flex items-center gap-2 mx-auto hover:shadow-md transition-all transform hover:scale-105"
                        >
                            <PlusCircle size={16} />
                            <span>Create Event</span>
                        </button>
                    )}
                </>
            )}
        </div>
    </div>
);

const EventPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // For debounced search
    const [dateFilter, setDateFilter] = useState('');
    const [primaryClubId, setPrimaryClubId] = useState('');
    const [primaryClubName, setPrimaryClubName] = useState('');
    const [page, setPage] = useState(0);
    const [clubDetails, setClubDetails] = useState([]);
    const [error, setError] = useState('');
    const token = localStorage.getItem("jwtToken");
    const observer = useRef();
    const ITEMS_PER_PAGE = 9;

    let decodedToken = null;
    if (token) {
        try {
            decodedToken = jwtDecode(token);
        } catch (error) {
            console.error("Error decoding JWT token:", error.message);
        }
    }

    // Debounce the search query update
    const debouncedSearch = useCallback(
        _.debounce((value) => {
            setSearchQuery(value);
            setPage(0);
            setEvents([]);
        }, 500),
        []
    );

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    // Update date filter
    const handleDateChange = (e) => {
        setDateFilter(e.target.value);
        setPage(0);
        setEvents([]);
    };

    const lastEventElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchClubDetails = async () => {
        try {
            if (!token || !decodedToken?.email) {
                setError('No auth token or email found. Please log in.');
                return;
            }

            const response = await fetch(`${backendUrl}/api/v1/club?email=${decodedToken.email}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();

            if (response.ok && result.clubs?.length > 0) {
                setClubDetails(result.clubs);
                setPrimaryClubId(result.clubs[0]._id);
                setPrimaryClubName(result.clubs[0].name);
            }
        } catch (error) {
            console.error("Error fetching club details:", error);
            setError('Failed to fetch club details. Please try again later.');
        }
    };

    const fetchEvents = async (pageNum = 0, reset = false) => {
        try {
            if (!token || !decodedToken?.clubId) {
                setError('No auth token or club ID found. Please log in.');
                return;
            }

            setLoading(true);
            const skip = pageNum * ITEMS_PER_PAGE;

            const params = {
                clubId: decodedToken.clubId,
                limit: ITEMS_PER_PAGE,
                skip
            };

            // Add search and date filters if they exist
            if (searchQuery) params.search = searchQuery;
            if (dateFilter) params.date = dateFilter;

            const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data && response.data.events) {
                if (reset) {
                    setEvents(response.data.events);
                } else {
                    setEvents(prev => [...prev, ...response.data.events]);
                }
                setHasMore(response.data.events.length === ITEMS_PER_PAGE);
            } else {
                setHasMore(false);
            }

        } catch (err) {
            console.error('Error fetching events:', err.response || err.message);
            setError('Failed to load events. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchClubDetails();
    }, []);

    // Fetch events when page changes
    useEffect(() => {
        fetchEvents(page);
    }, [page]);

    // Reset and fetch events when search query or date filter changes
    useEffect(() => {
        if (page === 0) {
            fetchEvents(0, true);
        } else {
            setPage(0); // This will trigger the page change effect
        }
    }, [searchQuery, dateFilter]);

    const handleDeleteEvent = async (eventId, e) => {
        e.stopPropagation(); // Prevent card click event

        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await axios.delete(`${backendUrl}/api/v1/club/events?id=${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvents(events.filter(event => event._id !== eventId));
                // Show success message
                alert('Event deleted successfully.');
                // Remove event from state
            } catch (err) {
                console.error('Error deleting event:', err.response || err.message);
                setError('Failed to delete event. Please try again.');
            }
        }
    };

    const handleEditEvent = (event, e) => {
        e.stopPropagation(); // Prevent card click event
        navigate(`/events/edit/${event._id}`, {
            state: { event, primaryClubId, primaryClubName }
        });
    };

    const handleCreateEvent = () => {
        navigate('/events/create', {
            state: { primaryClubId, primaryClubName }
        });
    };

    const handleRefresh = () => {
        setPage(0);
        setEvents([]);
        fetchEvents(0, true);
    };

    // Determine if we need to show loading or empty state
    const shouldShowEmptyState = loading && events.length === 0;

    return (
        <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">

            {/* Header with Glass Effect */}
            <div className="sticky top-0 z-10 backdrop-filter backdrop-blur-md shadow-lg bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 dark:border-b dark:border-gray-800">
                <div className="container mx-auto py-4 px-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="inline-block p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transform rotate-1">
                            <div className="bg-white dark:bg-gray-800 p-1 rounded-md transform -rotate-1">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent px-2">
                                    Event Dashboard
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Create event button */}
                            <button
                                onClick={handleCreateEvent}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                            >
                                <PlusCircle size={16} />
                                <span>Create Event</span>
                            </button>

                            {/* Refresh button */}
                            <button
                                onClick={handleRefresh}
                                className="p-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-600 border-indigo-100 dark:border-gray-600 rounded-full shadow-md transition-all border"
                                aria-label="Refresh events"
                            >
                                <RefreshCcw size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border-red-500 dark:border-red-700 border-l-4 rounded-md flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-indigo-400 dark:text-indigo-300" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white dark:bg-gray-800 border-indigo-100 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>

                        <div className="relative sm:w-48">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-indigo-400 dark:text-indigo-300" />
                            </div>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={handleDateChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white dark:bg-gray-800 border-indigo-100 dark:border-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-6">
                {shouldShowEmptyState ? (
                    <EmptyState loading={loading} hasFilters={!!searchTerm || !!dateFilter} onCreateEvent={handleCreateEvent} />
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event, index) => {
                            if (events.length === index + 1) {
                                return (
                                    <div ref={lastEventElementRef} key={event._id} className="relative rounded-xl overflow-hidden group">
                                        <EventCard
                                            event={event}
                                            onEdit={(e) => handleEditEvent(event, e)}
                                            onDelete={(e) => handleDeleteEvent(event._id, e)}
                                        />
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={event._id} className="relative rounded-xl overflow-hidden group">
                                        <EventCard
                                            event={event}
                                            onEdit={(e) => handleEditEvent(event, e)}
                                            onDelete={(e) => handleDeleteEvent(event._id, e)}
                                        />
                                    </div>
                                );
                            }
                        })}
                    </div>
                ) : (
                    <EmptyState loading={loading} hasFilters={!!searchTerm || !!dateFilter} onCreateEvent={handleCreateEvent} />
                )}

                {/* Loading indicator for pagination */}
                {loading && events.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <div className="relative">
                            <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                            <div className="w-8 h-8 border-l-2 border-r-2 border-purple-600 rounded-full animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventPage;