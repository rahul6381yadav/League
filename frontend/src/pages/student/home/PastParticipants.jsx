import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { backendUrl } from "../../../utils/routes";
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const PastParticipants = ({ studentId }) => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 4; // Increased for horizontal layout
    const [maxPoints, setMaxPoints] = useState(100); // Default max points
    const navigate = useNavigate();

    useEffect(() => {
        if (!studentId) {
            console.error("Student ID is required");
            setError("Student ID is required");
            setIsLoading(false);
            return;
        }

        const fetchAttendanceData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                console.error("JWT token not found");
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
                if (Array.isArray(result.records)) {
                    // Sort the attendance data by event start date (descending)
                    const sortedData = result.records
                        .filter(record => record.status === "present" && record.eventId)
                        .sort((a, b) => {
                            const dateA = new Date(a.eventId.date);
                            const dateB = new Date(b.eventId.date);
                            return dateB - dateA; // Compare dates for descending order
                        });
                    setAttendanceData(sortedData);

                    // Find max points from events for percentage calculation
                    const highestPoints = sortedData.reduce((max, record) => {
                        return Math.max(max, record.eventId.maxPoints || 100);
                    }, 100);
                    setMaxPoints(highestPoints);
                    console.log(sortedData);
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

    const handleNext = () => {
        if (currentPage * eventsPerPage < attendanceData.length) {
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

    const displayedEvents = attendanceData.slice(
        (currentPage - 1) * eventsPerPage,
        currentPage * eventsPerPage
    );

    if (isLoading) {
        return (
            <div className="p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                <div className="flex flex-col items-center justify-center h-40">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-mirage-900 dark:text-mirage-50">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-mirage-900 dark:text-mirage-50 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Your Past Participations
                    {attendanceData.length > 0 && (
                        <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                            {attendanceData.length}
                        </span>
                    )}
                </h2>
                <button
                    onClick={() => navigate('/allPastParticipations', { state: { studentId } })}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center transition-colors"
                >
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {attendanceData.length === 0 ? (
                <div className="bg-white dark:bg-mirage-700 p-6 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-mirage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="mt-2 text-mirage-600 dark:text-mirage-400">No participation records found</p>
                    <p className="text-sm text-mirage-500 dark:text-mirage-500 mt-1">Participate in events to see your history here</p>
                </div>
            ) : (
                <>
                    {/* Horizontal scrollable container */}
                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
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

                                // Calculate point percentage based on event max points if available
                                const eventMaxPoints = participation.eventId.maxPoints || maxPoints;
                                const pointPercentage = calculatePercentage(participation.pointsGiven || 0, eventMaxPoints);

                                return (
                                    <div
                                        key={index}
                                        className="bg-white dark:bg-mirage-700 p-5 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-purple-500 cursor-pointer transform hover:scale-[1.02] duration-200 flex flex-col w-64"
                                        onClick={() => navigate(`/event-signup/${participation.eventId._id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-mirage-950 dark:text-mirage-50 line-clamp-1">
                                                    {participation.eventId.name || participation.eventId.eventName}
                                                </h3>
                                                <p className="text-xs text-mirage-600 dark:text-mirage-400 mt-1">
                                                    {formattedDate}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Points progress circle */}
                                        <div className="my-3 flex items-center justify-center">
                                            <div className="w-20 h-20 relative">
                                                <CircularProgressbar
                                                    value={pointPercentage}
                                                    text={`${participation.pointsGiven || 0}`}
                                                    styles={buildStyles({
                                                        textSize: '28px',
                                                        pathColor: `rgba(147, 51, 234, ${pointPercentage / 100 + 0.3})`,
                                                        textColor: '#9333EA',
                                                        trailColor: '#F3E8FF',
                                                    })}
                                                />
                                                <div className="absolute -bottom-2 left-0 right-0 text-center">
                                                    <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-0.5 rounded-full">
                                                        {pointPercentage}%
                                                    </span>
                                                </div>
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
                    </div>

                    {/* Pagination controls */}
                    {attendanceData.length > eventsPerPage && (
                        <div className="mt-4 flex justify-between items-center">
                            <button
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${currentPage === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Previous
                            </button>

                            <span className="text-sm text-mirage-600 dark:text-mirage-400">
                                Page {currentPage} of {Math.ceil(attendanceData.length / eventsPerPage)}
                            </span>

                            <button
                                onClick={handleNext}
                                disabled={currentPage * eventsPerPage >= attendanceData.length}
                                className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${currentPage * eventsPerPage >= attendanceData.length
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    }`}
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PastParticipants;
