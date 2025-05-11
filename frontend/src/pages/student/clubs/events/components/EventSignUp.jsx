import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../context/AuthContext";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaChevronRight } from "react-icons/fa";
import { Mail, Trophy, Medal, Clock, AlertCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { backendUrl } from "../../../../../utils/routes";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const token = localStorage.getItem("jwtToken");
let decodedToken = null;
if (token) {
    try {
        decodedToken = jwtDecode(token);
    } catch (error) {
        console.error("Error decoding JWT token:", error.message);
    }
}

const EventSignUp = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [winners, setWinners] = useState([]);
    const [isParticipated, setIsParticipated] = useState(false);
    const [isEventEnded, setIsEventEnded] = useState(false);
    const [maxPoints, setMaxPoints] = useState(100);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                const sortedParticipants = response.data.records.sort((a, b) => b.pointsGiven - a.pointsGiven);
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
    }, [id, decodedToken?.userId, token]);

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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950">
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden transition-transform hover:shadow-xl">
                    <div className="relative w-full" style={{ paddingBottom: '40%' }}>
                        <div className="absolute inset-0">
                            {event && event.photo ? (
                                <img
                                    src={event.photo}
                                    alt="Event Banner"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center">
                                    <div className="text-center">
                                        <Trophy className="text-white/80 text-6xl mb-4 animate-pulse" />
                                        <h3 className="text-white text-xl font-bold tracking-wider">{event?.eventName || "LEAGUE EVENT"}</h3>
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        </div>
                    </div>

                    <div className="p-6">
                        {event ? (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                        {event.eventName}
                                    </h1>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-medium border border-indigo-200/50 dark:border-violet-700/30">
                                            {event.category || "Event"}
                                        </span>

                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border 
                                            ${isEventEnded
                                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200/50 dark:border-red-700/30"
                                                : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200/50 dark:border-green-700/30"
                                            }`}>
                                            {isEventEnded ? "Ended" : "Active"}
                                        </span>

                                        {event.totalWinner > 0 && (
                                            <span className="bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-medium border border-amber-200/50 dark:border-amber-700/30">
                                                {event.totalWinner} {event.totalWinner === 1 ? "Winner" : "Winners"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center text-indigo-700 dark:text-indigo-300 text-sm">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                                            <FaCalendarAlt className="text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs block">Date & Time</span>
                                            <span>{formatDateTime(event.date)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-indigo-700 dark:text-indigo-300 text-sm">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                                            <FaMapMarkerAlt className="text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs block">Venue</span>
                                            <span>{event.venue}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-indigo-700 dark:text-indigo-300 text-sm">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                                            <FaClock className="text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs block">Duration</span>
                                            <span>{event.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                {event.description && (
                                    <div className="mt-4 border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                            {event.description}
                                        </p>
                                    </div>
                                )}

                                {event.clubIds && event.clubIds.length > 0 && (
                                    <div className="mt-6 border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Collaborating Clubs:
                                        </h4>
                                        <div className="flex flex-wrap gap-3">
                                            {event.clubIds.map((club) => (
                                                <div key={club._id} className="flex items-center bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                                                    {club.image && (
                                                        <img
                                                            src={club.image}
                                                            alt={club.name}
                                                            className="w-6 h-6 rounded-full object-cover mr-2"
                                                            onError={(e) => e.target.style.display = 'none'}
                                                        />
                                                    )}
                                                    <span className="text-sm text-indigo-700 dark:text-indigo-300">{club.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-indigo-200/50 dark:bg-indigo-800/30 rounded w-2/3"></div>
                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-indigo-200/50 dark:bg-indigo-800/30 mr-3"></div>
                                            <div className="space-y-2">
                                                <div className="h-2 bg-indigo-200/50 dark:bg-indigo-800/30 rounded w-12"></div>
                                                <div className="h-3 bg-indigo-200/50 dark:bg-indigo-800/30 rounded w-20"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">Registration Status</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isParticipated ? 'You are registered for this event' : 'Register to participate in this event'}
                            </p>
                        </div>

                        <button
                            onClick={handleSignUp}
                            disabled={isParticipated || isEventEnded}
                            className={`px-6 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition-all ${isParticipated
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 cursor-not-allowed'
                                : isEventEnded
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-md hover:-translate-y-0.5'
                                }`}
                        >
                            {isParticipated ? (
                                <>
                                    <FaUsers className="mr-2" />
                                    Registered
                                </>
                            ) : isEventEnded ? (
                                <>
                                    <Clock className="mr-2" />
                                    Registration Closed
                                </>
                            ) : (
                                <>
                                    <FaUsers className="mr-2" />
                                    Register Now
                                </>
                            )}
                        </button>
                    </div>

                    {isEventEnded && !isParticipated && (
                        <div className="mt-3 flex items-start bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3">
                            <AlertCircle className="text-amber-500 mr-2 flex-shrink-0" size={18} />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                This event has ended. Registration is closed. Please contact the event coordinator if you need to join.
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {isEventEnded && winners.length > 0 && (
                        <div className="lg:col-span-1 bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Trophy size={24} /> Winners
                                </h2>
                            </div>
                            <div className="p-4 max-h-[400px] overflow-y-auto">
                                <div className="space-y-3">
                                    {winners.map((winner, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/40 dark:to-violet-900/40 border border-indigo-100 dark:border-violet-800/50 hover:shadow-md transition-all"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={winner.studentId?.photo || '/api/placeholder/48/48'}
                                                    alt={winner.studentId?.fullName}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400 dark:ring-violet-500"
                                                />
                                                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                                    {winner.studentId?.fullName}
                                                </h4>
                                                <div className="flex items-center">
                                                    <span className="text-xs bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent font-semibold">
                                                        {winner.pointsGiven || 0} points
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-10 h-10">
                                                <CircularProgressbar
                                                    value={calculatePercentage(winner.pointsGiven || 0)}
                                                    text={`${calculatePercentage(winner.pointsGiven || 0)}%`}
                                                    styles={buildStyles({
                                                        textSize: '28px',
                                                        pathColor: `rgba(99, 102, 241, ${calculatePercentage(winner.pointsGiven || 0) / 100 + 0.3})`,
                                                        textColor: '#6366F1',
                                                        trailColor: '#E0E7FF',
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`${isEventEnded && winners.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden`}>
                        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <FaUsers size={20} /> Participants
                            </h2>
                            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                                {participants.length} Registered
                            </span>
                        </div>

                        <div className="overflow-hidden">
                            {participants.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-indigo-500/90 via-violet-500/90 to-purple-500/90 text-white">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Participant</th>
                                                {isEventEnded && <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Points</th>}
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {participants.map((participant, index) => (
                                                <tr
                                                    key={participant._id}
                                                    className={`${index % 2 === 0
                                                        ? 'bg-indigo-50/70 dark:bg-indigo-900/20'
                                                        : 'bg-violet-50/70 dark:bg-violet-900/20'} 
                                                        hover:bg-gradient-to-r hover:from-indigo-100/80 hover:to-violet-100/80 
                                                        dark:hover:from-indigo-800/30 dark:hover:to-violet-800/30 
                                                        transition-all duration-200 backdrop-blur-sm`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900 dark:text-indigo-300">
                                                        <div className="flex justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover border-2 border-indigo-300 dark:border-violet-500"
                                                                    src={participant.studentId?.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                                                    {participant.studentId?.fullName}
                                                                </div>
                                                                <div className="text-xs text-indigo-500 dark:text-indigo-400">
                                                                    {participant.studentId?.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {isEventEnded && (
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center justify-center">
                                                                <div className="w-16 h-16 relative">
                                                                    <CircularProgressbar
                                                                        value={calculatePercentage(participant.pointsGiven || 0)}
                                                                        text={`${participant.pointsGiven || 0}`}
                                                                        styles={buildStyles({
                                                                            textSize: '28px',
                                                                            pathColor: `rgba(99, 102, 241, ${calculatePercentage(participant.pointsGiven || 0) / 100 + 0.2})`,
                                                                            textColor: '#6366F1',
                                                                            trailColor: '#E0E7FF',
                                                                        })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    )}

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                                                            ${participant.status === 'present'
                                                                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                                                                : 'bg-gradient-to-r from-red-400 to-red-500 text-white'}`}
                                                        >
                                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 
                                                                ${participant.status === 'present' ? 'bg-green-400' : 'bg-red-400'}`}>
                                                            </span>
                                                            <span className="relative">
                                                                {participant.status === "present" ? "Present" : "Absent"}
                                                            </span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FaUsers className="text-4xl text-indigo-300 dark:text-indigo-600 mb-4" />
                                    <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-200">No participants yet</h3>
                                    <p className="mt-1 text-sm text-indigo-500 dark:text-indigo-400">Be the first to join this event!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isEventEnded && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex items-center">
                        <Clock className="text-amber-600 dark:text-amber-400 mr-3" />
                        <div>
                            <h3 className="font-medium text-amber-800 dark:text-amber-300">This event has ended</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                This event is no longer active. The results and points are now final.
                                {!isParticipated && " Registration is closed."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

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

                .animate-gradient-text {
                    animation: gradient 3s ease infinite;
                    background-size: 300% 300%;
                }

                .animate-spin-slow {
                    animation: spin-slow 4s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default EventSignUp;