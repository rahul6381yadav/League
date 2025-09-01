import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../context/AuthContext";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaCommentAlt } from "react-icons/fa";
import { Mail, Trophy, Medal, Clock, AlertCircle, MessageCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { backendUrl } from "../../../../../utils/routes";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const EventSignUp = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [winners, setWinners] = useState([]);
    const [isParticipated, setIsParticipated] = useState(false);
    const [isEventEnded, setIsEventEnded] = useState(false);
    const [maxPoints, setMaxPoints] = useState(100);
    const [loading, setLoading] = useState(true);
    const [commentPopup, setCommentPopup] = useState({ visible: false, content: '', position: { x: 0, y: 0 } });
    const token = localStorage.getItem("jwtToken");
    let decodedToken = null;
    if (token) {
        try {
            decodedToken = jwtDecode(token);
        } catch (error) {
            console.error("Error decoding JWT token:", error.message);
        }
    }
    const navigate = useNavigate();

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (commentPopup.visible && !event.target.closest('.comment-popup')) {
                setCommentPopup(prev => ({ ...prev, visible: false }));
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [commentPopup.visible]);

    const calculatePercentage = (points) => {
        return Math.min(Math.round((points / maxPoints) * 100), 100);
    };

    // Check if event has ended based on endDate or fallback to calculation from date + duration
    const checkIfEventEnded = (eventData) => {
        if (!eventData || !eventData.date) return false;

        // If endDate is available, use it directly
        if (eventData.endDate) {
            const endDateTime = new Date(eventData.endDate);
            return new Date() > endDateTime;
        }

        // Fallback to calculating from date + duration if no endDate available
        const eventDate = new Date(eventData.date);

        // Default end time if we can't calculate from duration
        let endTime = new Date(eventDate);
        endTime.setHours(endTime.getHours() + 2); // Default 2 hours if no duration available

        // Try to parse duration if available
        if (eventData.duration) {
            let durationHours = 0;
            const durationString = eventData.duration.toLowerCase();

            if (durationString.includes('hour')) {
                const hours = durationString.match(/(\d+)\s*hour/);
                if (hours && hours[1]) durationHours += parseInt(hours[1]);
            }

            if (durationString.includes('minute')) {
                const minutes = durationString.match(/(\d+)\s*minute/);
                if (minutes && minutes[1]) durationHours += parseInt(minutes[1]) / 60;
            }

            endTime = new Date(eventDate);
            endTime.setHours(eventDate.getHours() + durationHours);
        }

        return new Date() > endTime;
    };

    const getWinners = async (eventData) => {
        if (!eventData || !eventData.totalWinner) return;

        try {
            const response = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { eventId: id }
            });

            const records = response.data.records || [];
            const topWinners = records
                .sort((a, b) => b.pointsGiven - a.pointsGiven)
                .slice(0, eventData.totalWinner);

            setWinners(topWinners);
        } catch (error) {
            console.error("Error fetching winners:", error);
        }
    };

    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                    params: { id },
                    headers: { Authorization: `Bearer ${token}` },
                });

                const eventData = response.data.event;

                // Check if it's a team event and redirect if needed
                if (eventData && eventData.maxMember > 1) {
                    navigate(`/team-event/${id}`);
                    return;
                }

                setEvent(eventData);

                if (eventData && eventData.maxPoints) {
                    setMaxPoints(eventData.maxPoints);
                }

                setIsEventEnded(checkIfEventEnded(eventData));

                if (checkIfEventEnded(eventData)) {
                    getWinners(eventData);
                }
            } catch (error) {
                console.error("Error fetching event details:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        const getParticipants = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { eventId: id },
                });

                // Get participants and sort them by points
                const sortedParticipants = (response.data.records || []).sort((a, b) => b.pointsGiven - a.pointsGiven);
                setParticipants(sortedParticipants);
            } catch (error) {
                console.error("Error fetching participants:", error.response?.data || error.message);
            }
        };

        const checkParticipation = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { studentId: decodedToken.userId, eventId: id },
                });
                const records = Array.isArray(response.data.records) ? response.data.records : [];
                setIsParticipated(records.length > 0);
            } catch (error) {
                console.error("Error checking participation:", error.response?.data || error.message);
            }
        };

        fetchEventDetails();
        getParticipants();
        checkParticipation();
    }, [id, decodedToken?.userId, token, navigate]);

    const handleSignUp = async () => {
        if (isEventEnded) {
            alert("This event has already ended. Registration is closed.");
            return;
        }

        if (!isParticipated && decodedToken.userId) {
            try {
                const participationData = {
                    participations: [{
                        studentId: decodedToken.userId,
                        eventId: id,
                        pointsGiven: 0,
                        status: "absent",
                        isWinner: false
                    }]
                };

                await axios.post(
                    `${backendUrl}/api/v1/club/attendance`,
                    participationData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setIsParticipated(true);

                const response = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { eventId: id },
                });

                const sortedParticipants = (response.data.records || []).sort((a, b) => b.pointsGiven - a.pointsGiven);
                setParticipants(sortedParticipants);

                alert("Successfully signed up for the event!");
            } catch (error) {
                console.error("Error signing up:", error.response?.data || error.message);
                alert("Failed to sign up for the event.");
            }
        } else {
            alert("Login again to participate in the event.");
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCommentClick = (comment, event) => {
        event.stopPropagation();
        event.preventDefault();

        if (!comment || comment.trim() === '') {
            console.log("No comment available to display");
            return;
        }

        // Get the button position
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();

        // Position popup next to the profile
        const x = rect.right + 5;
        const y = rect.top;

        setCommentPopup({
            visible: true,
            content: comment,
            position: { x, y }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            {/* Comment popup */}
            {commentPopup.visible && commentPopup.content && (
                <div
                    className="comment-popup fixed z-50 bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-indigo-200 dark:border-indigo-700 p-3 animate-fade-in"
                    style={{
                        left: `${commentPopup.position.x}px`,
                        top: `${commentPopup.position.y}px`,
                        maxWidth: '200px',
                        minWidth: '150px'
                    }}
                >
                    <div className="flex justify-between items-start mb-1">
                        <MessageCircle size={14} className="text-indigo-600 dark:text-indigo-400 mt-0.5" />
                        <button
                            onClick={() => setCommentPopup(prev => ({ ...prev, visible: false }))}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-xs">
                        {commentPopup.content}
                    </p>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-4">
                {/* Event Header - Compact */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-200/30 dark:border-violet-700/30 overflow-hidden">
                    <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                        {event?.photo && (
                            <img
                                src={event.photo}
                                alt="Event Banner"
                                className="w-full h-full object-cover mix-blend-overlay"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-3 left-4 right-4">
                            <h1 className="text-xl font-bold text-white truncate">
                                {event?.eventName || "Event"}
                            </h1>
                        </div>
                    </div>

                    <div className="p-4">
                        {/* Compact Event Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="flex items-center text-xs">
                                <FaCalendarAlt className="text-indigo-500 mr-2" size={12} />
                                <span className="text-gray-600 dark:text-gray-400">{formatDateTime(event?.date)}</span>
                            </div>
                            <div className="flex items-center text-xs">
                                <FaMapMarkerAlt className="text-indigo-500 mr-2" size={12} />
                                <span className="text-gray-600 dark:text-gray-400 truncate">{event?.venue}</span>
                            </div>
                            <div className="flex items-center text-xs">
                                <FaClock className="text-indigo-500 mr-2" size={12} />
                                <span className="text-gray-600 dark:text-gray-400">{event?.duration}</span>
                            </div>
                            <div className="flex items-center text-xs">
                                <FaUsers className="text-indigo-500 mr-2" size={12} />
                                <span className="text-gray-600 dark:text-gray-400">{participants.length} registered</span>
                            </div>
                        </div>

                        {/* Status badges and registration */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md text-xs">
                                    {event?.category || "Event"}
                                </span>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium 
                                    ${isEventEnded
                                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                    }`}>
                                    {isEventEnded ? "Ended" : "Active"}
                                </span>
                                {event?.totalWinner > 0 && (
                                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md text-xs">
                                        {event.totalWinner} Winner{event.totalWinner > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={handleSignUp}
                                disabled={isParticipated || isEventEnded}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isParticipated
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 cursor-not-allowed'
                                    : isEventEnded
                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-md hover:scale-105'
                                    }`}
                            >
                                {isParticipated ? 'Registered' : isEventEnded ? 'Closed' : 'Register'}
                            </button>
                        </div>

                        {/* Description - Collapsible */}
                        {event?.description && (
                            <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800">
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                    {event.description}
                                </p>
                            </div>
                        )}

                        {/* Collaborating clubs - compact */}
                        {event?.clubIds?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Clubs:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {event.clubIds.slice(0, 3).map((club) => (
                                            <div key={club._id} className="flex items-center bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded text-xs">
                                                {club.image && (
                                                    <img
                                                        src={club.image}
                                                        alt={club.name}
                                                        className="w-4 h-4 rounded-full object-cover mr-1"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                )}
                                                <span className="text-indigo-600 dark:text-indigo-400 truncate max-w-20">{club.name}</span>
                                            </div>
                                        ))}
                                        {event.clubIds.length > 3 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">+{event.clubIds.length - 3} more</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Winners Section - Compact */}
                    {isEventEnded && winners.length > 0 && (
                        <div className="lg:col-span-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/30 dark:border-amber-700/30">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Trophy size={18} /> Winners
                                </h2>
                            </div>
                            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                                {winners.map((winner, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800/30"
                                    >
                                        <div className="relative">
                                            <img
                                                src={winner.studentId?.photo || '/api/placeholder/32/32'}
                                                alt={winner.studentId?.fullName}
                                                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400"
                                            />
                                            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 truncate">
                                                {winner.studentId?.fullName}
                                            </h4>
                                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                {winner.pointsGiven || 0} pts
                                            </span>
                                        </div>
                                        <div className="w-8 h-8">
                                            <CircularProgressbar
                                                value={calculatePercentage(winner.pointsGiven || 0)}
                                                styles={buildStyles({
                                                    textSize: '24px',
                                                    pathColor: '#F59E0B',
                                                    textColor: '#F59E0B',
                                                    trailColor: '#FEF3C7',
                                                })}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Participants Section - Compact */}
                    <div className={`${isEventEnded && winners.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-200/30 dark:border-violet-700/30`}>
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FaUsers size={18} /> Participants
                            </h2>
                            <span className="px-2 py-1 bg-white/20 text-white rounded-md text-sm">
                                {participants.length}
                            </span>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {participants.length > 0 ? (
                                <div className="divide-y divide-indigo-100 dark:divide-indigo-800/30">
                                    {participants.map((participant, index) => (
                                        <div
                                            key={participant._id}
                                            className="flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                <img
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-200 dark:border-violet-600"
                                                    src={participant.studentId?.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                    alt=""
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200 truncate">
                                                            {participant.studentId?.fullName}
                                                        </span>
                                                        {(participant.comment || participant.comments) && (
                                                            <button
                                                                className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-full"
                                                                onClick={(e) => handleCommentClick(participant.comment || participant.comments, e)}
                                                                title="View comment"
                                                            >
                                                                <FaCommentAlt size={10} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-indigo-500 dark:text-indigo-400 truncate block">
                                                        {participant.studentId?.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {isEventEnded && (
                                                    <div className="text-right">
                                                        <div className="w-10 h-10">
                                                            <CircularProgressbar
                                                                value={calculatePercentage(participant.pointsGiven || 0)}
                                                                text={`${participant.pointsGiven || 0}`}
                                                                styles={buildStyles({
                                                                    textSize: '24px',
                                                                    pathColor: '#6366F1',
                                                                    textColor: '#6366F1',
                                                                    trailColor: '#E0E7FF',
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium
                                                    ${participant.status === 'present'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}
                                                >
                                                    {participant.status === "present" ? "Present" : "Absent"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <FaUsers className="text-2xl text-indigo-300 dark:text-indigo-600 mb-2" />
                                    <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-200">No participants yet</h3>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400">Be the first to join!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Event ended notice - compact */}
                {isEventEnded && !isParticipated && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 flex items-center gap-3">
                        <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={16} />
                        <div>
                            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Event Ended</h3>
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                Registration is closed. Contact event coordinator if needed.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-in-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default EventSignUp;