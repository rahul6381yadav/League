import React, { useState, useEffect } from "react";
import { backendUrl } from "../../utils/routes";
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useLocation } from 'react-router-dom';
const AllPastParticipation = () => {
    const { state } = useLocation();
    const studentId = state?.studentId;
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTab, setSelectedTab] = useState('all');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const eventsPerPage = 8;
    const [maxPoints, setMaxPoints] = useState(100);
    const navigate = useNavigate();
    const [totalStats, setTotalStats] = useState({
        totalEvents: 0,
        totalPoints: 0,
        averagePoints: 0,
        highestPoints: 0
    });

    useEffect(() => {
        if (!studentId) {
            setError("Student ID is required");
            setIsLoading(false);
            return;
        }

        const fetchAttendanceData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                setError("User not authenticated");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${backendUrl}/api/v1/club/attendance?studentId=${studentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (result && result.records && Array.isArray(result.records)) {
                    // Sort the attendance data by event start date (descending)
                    const sortedData = result.records
                        .filter(record => record && record.eventId)
                        .sort((a, b) => {
                            if (!a.eventId || !b.eventId || !a.eventId.date || !b.eventId.date) return 0;
                            const dateA = new Date(a.eventId.date);
                            const dateB = new Date(b.eventId.date);
                            return dateB - dateA; // Compare dates for descending order
                        });

                    setAttendanceData(sortedData);

                    // Calculate stats
                    calculateStats(sortedData);

                    // Find max points from events
                    const highestPoints = sortedData.reduce((max, record) => {
                        return Math.max(max, record.eventId && record.eventId.maxPoints ? record.eventId.maxPoints : 100);
                    }, 100);
                    setMaxPoints(highestPoints);
                } else {
                    console.error("Unexpected API response:", result);
                    setAttendanceData([]);
                }
            } catch (fetchError) {
                console.error("Error fetching attendance data:", fetchError.message);
                setError("Failed to fetch attendance data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceData();
    }, [studentId]);

    const calculateStats = (data) => {
        try {
            if (!Array.isArray(data)) {
                throw new Error("Invalid data format");
            }
            const presentEvents = data.filter(record => record && record.status === "present");
            const totalPoints = presentEvents.reduce((sum, record) => sum + (record.pointsGiven || 0), 0);
            const avgPoints = presentEvents.length > 0 ? totalPoints / presentEvents.length : 0;
            const highestEvent = presentEvents.reduce((max, record) =>
                Math.max(max, record.pointsGiven || 0), 0);

            setTotalStats({
                totalEvents: presentEvents.length,
                totalPoints,
                averagePoints: Math.round(avgPoints * 10) / 10,
                highestPoints: highestEvent
            });
        } catch (err) {
            console.error("Error calculating stats:", err);
            setTotalStats({
                totalEvents: 0,
                totalPoints: 0,
                averagePoints: 0,
                highestPoints: 0
            });
        }
    };

    const handleNext = () => {
        if (currentPage * eventsPerPage < filteredEvents.length) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const calculatePercentage = (points, eventMaxPoints) => {
        const eventMax = eventMaxPoints || maxPoints;
        const percentage = Math.min(Math.round((points / eventMax) * 100), 100);
        return percentage;
    };

    // Filter and sort data based on user selections
    const getFilteredAndSortedData = () => {
        let filtered = [...attendanceData];

        // Apply status filter
        if (filter === 'present') {
            filtered = filtered.filter(record => record.status === 'present');
        } else if (filter === 'absent') {
            filtered = filtered.filter(record => record.status === 'absent');
        }

        // Apply tab filter (all/high-points/recent)
        if (selectedTab === 'high-points') {
            filtered.sort((a, b) => (b.pointsGiven || 0) - (a.pointsGiven || 0));
        } else if (selectedTab === 'recent') {
            filtered.sort((a, b) => {
                const dateA = new Date(a.eventId.date);
                const dateB = new Date(b.eventId.date);
                return dateB - dateA;
            });
        }

        // Apply sorting
        if (sortBy === 'date-asc') {
            filtered.sort((a, b) => {
                const dateA = new Date(a.eventId.date);
                const dateB = new Date(b.eventId.date);
                return dateA - dateB;
            });
        } else if (sortBy === 'date-desc') {
            filtered.sort((a, b) => {
                const dateA = new Date(a.eventId.date);
                const dateB = new Date(b.eventId.date);
                return dateB - dateA;
            });
        } else if (sortBy === 'points-high') {
            filtered.sort((a, b) => (b.pointsGiven || 0) - (a.pointsGiven || 0));
        } else if (sortBy === 'points-low') {
            filtered.sort((a, b) => (a.pointsGiven || 0) - (b.pointsGiven || 0));
        }

        return filtered;
    };

    const filteredEvents = getFilteredAndSortedData();
    const displayedEvents = filteredEvents.slice(
        (currentPage - 1) * eventsPerPage,
        currentPage * eventsPerPage
    );

    // Always set isLoading to false if user authentication fails
    useEffect(() => {
        if (error) {
            setIsLoading(false);
        }
    }, [error]);

    // Ensure we never stay in loading state if studentId is available but API call fails
    useEffect(() => {
        let timeout;
        if (isLoading && studentId) {
            timeout = setTimeout(() => {
                setIsLoading(false);
                if (!error) {
                    setError("Request timed out. Please try again later.");
                }
            }, 15000); // 15 seconds timeout
        }
        return () => clearTimeout(timeout);
    }, [isLoading, studentId, error]);

    if (isLoading) {
        return (
            <div className="p-6 bg-mirage-100 dark:bg-mirage-900 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-mirage-100 dark:bg-mirage-900 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center justify-center h-96">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-4 text-xl text-mirage-900 dark:text-mirage-50">Error: {error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-mirage-100 dark:bg-mirage-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-mirage-900 dark:text-mirage-50">My Participation History</h1>
                        <p className="text-mirage-600 dark:text-mirage-400">
                            View all your event participations and earned points
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/home')}
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                {/* Stats Overview Cards - Keep only total points */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="bg-white dark:bg-mirage-800 p-5 rounded-lg shadow-sm flex-1">
                        <h2 className="text-sm font-medium text-mirage-500 dark:text-mirage-400">Events Attended</h2>
                        <p className="text-3xl font-bold text-mirage-900 dark:text-mirage-50 mt-2">{totalStats.totalEvents}</p>
                        <div className="mt-2 text-xs text-mirage-500">Total events you've participated in</div>
                    </div>

                    <div className="bg-white dark:bg-mirage-800 p-5 rounded-lg shadow-sm flex-1">
                        <h2 className="text-sm font-medium text-mirage-500 dark:text-mirage-400">Total Points</h2>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{totalStats.totalPoints}</p>
                        <div className="mt-2 text-xs text-mirage-500">Cumulative points earned</div>
                    </div>

                    <div className="bg-white dark:bg-mirage-800 p-5 rounded-lg shadow-sm flex-1">
                        <h2 className="text-sm font-medium text-mirage-500 dark:text-mirage-400">Average Points</h2>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{totalStats.averagePoints}</p>
                        <div className="mt-2 text-xs text-mirage-500">Average points per event</div>
                    </div>
                </div>

                {/* Filter/View Controls */}
                <div className="bg-white dark:bg-mirage-800 p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setSelectedTab('all')}
                                className={`px-4 py-2 text-sm rounded-lg ${selectedTab === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-mirage-200 dark:bg-mirage-700 text-mirage-600 dark:text-mirage-400 hover:bg-mirage-300 dark:hover:bg-mirage-600'
                                    }`}
                            >
                                All Events
                            </button>
                            <button
                                onClick={() => setSelectedTab('high-points')}
                                className={`px-4 py-2 text-sm rounded-lg ${selectedTab === 'high-points'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-mirage-200 dark:bg-mirage-700 text-mirage-600 dark:text-mirage-400 hover:bg-mirage-300 dark:hover:bg-mirage-600'
                                    }`}
                            >
                                Highest Points
                            </button>
                            <button
                                onClick={() => setSelectedTab('recent')}
                                className={`px-4 py-2 text-sm rounded-lg ${selectedTab === 'recent'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-mirage-200 dark:bg-mirage-700 text-mirage-600 dark:text-mirage-400 hover:bg-mirage-300 dark:hover:bg-mirage-600'
                                    }`}
                            >
                                Most Recent
                            </button>
                        </div>

                        <div className="flex space-x-4">
                            <div>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="bg-mirage-100 dark:bg-mirage-700 border border-mirage-300 dark:border-mirage-600 text-mirage-900 dark:text-mirage-100 rounded-lg p-2 text-sm focus:ring-purple-600 focus:border-purple-600"
                                >
                                    <option value="all">All Status</option>
                                    <option value="present">Present Only</option>
                                    <option value="absent">Absent Only</option>
                                </select>
                            </div>

                            <div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-mirage-100 dark:bg-mirage-700 border border-mirage-300 dark:border-mirage-600 text-mirage-900 dark:text-mirage-100 rounded-lg p-2 text-sm focus:ring-purple-600 focus:border-purple-600"
                                >
                                    <option value="date-desc">Date (Newest)</option>
                                    <option value="date-asc">Date (Oldest)</option>
                                    <option value="points-high">Points (Highest)</option>
                                    <option value="points-low">Points (Lowest)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Event Cards Grid */}
                {attendanceData.length === 0 ? (
                    <div className="bg-white dark:bg-mirage-700 p-12 rounded-lg text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-mirage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="mt-4 text-xl font-medium text-mirage-600 dark:text-mirage-400">No participation records found</p>
                        <p className="text-mirage-500 dark:text-mirage-500 mt-2">Participate in events to see your history here</p>
                        <button
                            onClick={() => navigate('/events')}
                            className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Browse Events
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {displayedEvents.map((participation, index) => {
                                const eventStartDate = new Date(participation.eventId.date);
                                const formattedDate = eventStartDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                });

                                // Calculate how long ago the event was
                                const now = new Date();
                                const diffTime = Math.abs(now - eventStartDate);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                let timeAgo;

                                if (diffDays < 1) {
                                    timeAgo = "Today";
                                } else if (diffDays === 1) {
                                    timeAgo = "Yesterday";
                                } else if (diffDays < 30) {
                                    timeAgo = `${diffDays} days ago`;
                                } else if (diffDays < 365) {
                                    const months = Math.floor(diffDays / 30);
                                    timeAgo = `${months} month${months > 1 ? 's' : ''} ago`;
                                } else {
                                    const years = Math.floor(diffDays / 365);
                                    timeAgo = `${years} year${years > 1 ? 's' : ''} ago`;
                                }

                                // Calculate point percentage
                                const eventMaxPoints = participation.eventId.maxPoints || maxPoints;
                                const pointPercentage = calculatePercentage(participation.pointsGiven || 0, eventMaxPoints);

                                return (
                                    <div
                                        key={index}
                                        className={`bg-white dark:bg-mirage-700 p-5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:scale-[1.02] duration-200 flex flex-col
                      ${participation.status === 'present'
                                                ? 'border-l-4 border-green-500'
                                                : 'border-l-4 border-red-500'}`}
                                        onClick={() => navigate(`/event-signup/${participation.eventId._id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-mirage-950 dark:text-mirage-50 line-clamp-1">
                                                    {participation.eventId.name || participation.eventId.eventName}
                                                </h3>
                                                <div className="flex items-center text-xs text-mirage-600 dark:text-mirage-400 mt-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                    {formattedDate}
                                                </div>
                                            </div>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full 
                          ${participation.status === 'present'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
                                            >
                                                {participation.status === 'present' ? 'Present' : 'Absent'}
                                            </span>
                                        </div>

                                        {/* Points progress circle */}
                                        <div className="my-3 flex items-center justify-center">
                                            <div className="w-20 h-20 relative">
                                                <CircularProgressbar
                                                    value={participation.status === 'present' ? pointPercentage : 0}
                                                    text={participation.status === 'present' ? `${participation.pointsGiven || 0}` : '0'}
                                                    styles={buildStyles({
                                                        textSize: '28px',
                                                        pathColor: participation.status === 'present'
                                                            ? `rgba(147, 51, 234, ${pointPercentage / 100 + 0.3})`
                                                            : 'rgba(239, 68, 68, 0.5)',
                                                        textColor: participation.status === 'present' ? '#9333EA' : '#EF4444',
                                                        trailColor: participation.status === 'present' ? '#F3E8FF' : '#FEE2E2',
                                                    })}
                                                />
                                                {participation.status === 'present' && (
                                                    <div className="absolute -bottom-2 left-0 right-0 text-center">
                                                        <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-0.5 rounded-full">
                                                            {pointPercentage}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-mirage-500 dark:text-mirage-400">
                                                {timeAgo}
                                            </span>
                                            <div className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                                                {participation.eventId.venue || "Online"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination controls */}
                        {filteredEvents.length > eventsPerPage && (
                            <div className="mt-8 flex justify-between items-center bg-white dark:bg-mirage-800 p-4 rounded-lg shadow-sm">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                    className={`flex items-center px-4 py-2 rounded-lg text-sm ${currentPage === 1
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Previous
                                </button>

                                <div className="flex items-center">
                                    <p className="text-sm text-mirage-600 dark:text-mirage-400">
                                        Showing <span className="font-medium">{(currentPage - 1) * eventsPerPage + 1}</span> to{" "}
                                        <span className="font-medium">
                                            {Math.min(currentPage * eventsPerPage, filteredEvents.length)}
                                        </span>{" "}
                                        of <span className="font-medium">{filteredEvents.length}</span> events
                                    </p>
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={currentPage * eventsPerPage >= filteredEvents.length}
                                    className={`flex items-center px-4 py-2 rounded-lg text-sm ${currentPage * eventsPerPage >= filteredEvents.length
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                        }`}
                                >
                                    Next
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AllPastParticipation;
