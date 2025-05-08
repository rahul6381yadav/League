import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { backendUrl } from '../../../../utils/routes';
import { Loader2, Calendar, Search, PlusCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import _ from 'lodash'; // For debouncing

// Component for the event card with purple-indigo gradient design
const EventCard = ({ event, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCardClick = () => {
    navigate(`/events/${event._id}`, { state: { event } });
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 bg-opacity-95 border-indigo-100 dark:border-gray-700 backdrop-filter backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:transform hover:scale-102 cursor-pointer border"
    >
      {/* Event Header with Gradient Background */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 relative">
        <h3 className="text-lg font-semibold text-white truncate">{event.eventName}</h3>
        <p className="text-indigo-100 text-sm flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDate(event.date)}
        </p>
      </div>
      
      {/* Event Body */}
      <div className="p-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-3">{event.description}</p>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex space-x-2">
          <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded-full font-medium">
          📍 {event.venue || 'General'}
          </span>
          <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded-full font-medium">
          ⏰ {event.duration || 'General'}
          </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={(e) => onEdit(e)} 
              className="p-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => onDelete(e)} 
              className="p-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
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
              <div className="w-12 h-12 border-l-4 border-r-4 border-purple-600 rounded-full animate-spin absolute top-0 left-0" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
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
                await axios.delete(`${backendUrl}/api/v1/club/events/${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Remove event from state
                setEvents(events.filter(event => event._id !== eventId));
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
                    <EmptyState loading={loading} hasFilters={!!searchTerm || !!dateFilter} onCreateEvent={handleCreateEvent}/>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event, index) => {
                            if (events.length === index + 1) {
                                return (
                                    <div ref={lastEventElementRef} key={event._id}>
                                        <EventCard 
                                            event={event} 
                                            onEdit={(e) => handleEditEvent(event, e)}
                                            onDelete={(e) => handleDeleteEvent(event._id, e)} 
                                        />
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={event._id}>
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
                    <EmptyState loading={loading} hasFilters={!!searchTerm || !!dateFilter} onCreateEvent={handleCreateEvent}/>
                )}
                
                {/* Loading indicator for pagination */}
                {loading && events.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <div className="relative">
                            <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                            <div className="w-8 h-8 border-l-2 border-r-2 border-purple-600 rounded-full animate-spin absolute top-0 left-0" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventPage;