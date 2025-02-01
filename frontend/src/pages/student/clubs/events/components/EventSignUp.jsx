import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../../context/AuthContext";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { Mail, Trophy } from "lucide-react";
// decode jwt token
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { backendUrl } from "../../../../../utils/routes";

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
const getTrophyStyle = (index) => {
    switch (index) {
        case 0:
            return {
                color: '#FFD700', // Gold
                label: '1st',
                size: 'w-6 h-6',
                strokeWidth: 2
            };
        case 1:
            return {
                color: '#C0C0C0', // Silver
                label: '2nd',
                size: 'w-5 h-5',
                strokeWidth: 2
            };
        case 2:
            return {
                color: '#CD7F32', // Bronze
                label: '3rd',
                size: 'w-4 h-4',
                strokeWidth: 2
            };
        default:
            return null;
    }
};


const EventSignUp = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isParticipated, setIsParticipated] = useState(false);
    const token = localStorage.getItem("jwtToken");
    const navigate = useNavigate();
    const AttendanceCount = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/v1/club/attendance?eventId=${id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            // Ensure result.records exists and is an array
            if (Array.isArray(result.records)) {
                console.log(result.records.length); // Log attendance count
                increaseParticipationCount(result.records.length);
            } else {
                console.error("Invalid records data", result);
            }
        } catch (error) {
            console.log("Error fetching attendance:", error);
        }
    };

    const increaseParticipationCount = async (noOfParticipants) => {
        try {
            console.log("Token is here", token);

            // Fetch current event data first (to increment participantsCount correctly)
            const eventResponse = await fetch(`${backendUrl}/api/v1/club/events?id=${id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const eventData = await eventResponse.json();
            console.log("events data ", eventData);
            if (eventResponse.ok && eventData) {
                // Get the current participants count and increment it
                const updatedParticipantsCount = noOfParticipants;

                // Now, send the PUT request to update participants count
                const updateResponse = await fetch(`${backendUrl}/api/v1/club/events?id=${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",  // Ensure you set the correct content type
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        participantsCount: updatedParticipantsCount,
                    }),
                });

                if (updateResponse.ok) {
                    const data = await updateResponse.json();
                    console.log("Updated event:", data);
                } else {
                    console.error("Failed to update participants count:", await updateResponse.json());
                }
            } else {
                console.error("Error fetching event data or invalid response", eventData);
            }
        } catch (error) {
            console.log("Error updating participants count:", error);
        }
    };
    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                    params: { id },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvent(response.data.event);
            } catch (error) {
                console.error("Error fetching event details:", error.response?.data || error.message);
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
        AttendanceCount();
    }, [id, decodedToken.userId, token]);

    const handleSignUp = async () => {
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

                // Send the participation data to the API
                await axios.post(
                    `${backendUrl}/api/v1/club/attendance`, // Endpoint updated
                    participationData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setIsParticipated(true);

                // Fetch updated participation data and sort
                const response = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { eventId: id },
                });

                // Check if records exist and then sort
                const sortedParticipants = (response.data.records || []).sort((a, b) => b.pointsGiven - a.pointsGiven);
                setParticipants(sortedParticipants);

                AttendanceCount();
                alert("Successfully signed up for the event!");
            } catch (error) {
                console.error("Error signing up:", error.response?.data || error.message);
                alert("Failed to sign up for the event.");
            }
        }
        else {
            alert("login again to participate in event");
        }
    };


    return (
        <div className="h-screen w-full flex bg-mirage-50 dark:bg-mirage-900">
            <div className="h-full w-full grid grid-cols-1 md:grid-cols-[1fr,auto] gap-8 p-8 pb-20 md:pb-8">
                {/* Event Details Card - Left Side */}
                <div className="flex flex-col bg-white dark:bg-mirage-800 rounded-lg shadow-md max-h-full">
                    {/* Fixed Banner Section */}
                    <div className="relative w-full rounded-t-lg" style={{ paddingBottom: '42.8571%' }}>
                        <div className="absolute top-0 left-0 w-full h-full bg-mirage-200 dark:bg-mirage-600 flex items-center justify-center rounded-t-lg">
                            {(event && event.photo) ? (
                                <img
                                    src={event.photo}
                                    alt="Event Banner"
                                    className="w-full h-full object-cover rounded-t-lg"
                                />
                            ) : (
                                    // Replace the existing SVG in your code (around line 320) with:
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 600" className="w-full h-full">
                                        <rect width="1400" height="600" fill="#1a1a1a" />
                                        <path d="M0 540 L1400 420 L1400 600 L0 600 Z" fill="#2d2d2d" />
                                        <path d="M0 480 L1400 360 L1400 540 L0 540 Z" fill="#3d3d3d" />

                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>

                                        <text x="700" y="300"
                                            font-family="Arial Black, sans-serif"
                                            font-size="120"
                                            fill="#ffffff"
                                            text-anchor="middle"
                                            filter="url(#glow)">
                                            IIITR
                                        </text>

                                        <text x="700" y="380"
                                            font-family="Arial, sans-serif"
                                            font-size="40"
                                            fill="#cccccc"
                                            text-anchor="middle">
                                            LEAGUE
                                        </text>

                                        <line x1="400" y1="340" x2="1000" y2="340"
                                            stroke="#4a4a4a"
                                            stroke-width="3" />

                                        <circle cx="380" cy="340" r="6" fill="#6366f1" />
                                        <circle cx="1020" cy="340" r="6" fill="#6366f1" />
                                    </svg>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Content Section */}
                    <div className="flex-1 min-h-0">
                        <div className="h-full overflow-y-auto">
                            <div className="p-6">
                                {event ? (
                                    <>
                                        <h1 className="text-3xl font-bold text-mirage-600 dark:text-mirage-100 mb-4">{event.eventName}</h1>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                                                    <FaCalendarAlt className="mr-2 text-mirage-500" />
                                                    <span className="mr-2">Date:</span>
                                                    {new Date(event.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                                                    <FaMapMarkerAlt className="mr-2 text-mirage-500" />
                                                    <span className="mr-2">Venue:</span>
                                                    {event.venue}
                                                </div>
                                                <div className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                                                    <FaClock className="mr-2 text-mirage-500" />
                                                    <span className="mr-2">Duration:</span>
                                                    {event.duration}
                                                </div>
                                            </div>
                                            {event.clubIds && event.clubIds.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-semibold text-mirage-700 dark:text-mirage-200 mb-2">
                                                        Collaborating Clubs:
                                                    </h4>
                                                    <div className="flex flex-wrap gap-4">
                                                        {event.clubIds.map((club) => (
                                                            <div key={club._id} className="text-center">
                                                                <img
                                                                    src={club.image}
                                                                    alt={club.name}
                                                                    className="w-12 h-12 rounded-full border border-mirage-300 dark:border-mirage-500"
                                                                />
                                                                <p className="text-xs text-mirage-600 dark:text-mirage-300 mt-1">{club.name}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-mirage-700 dark:text-mirage-200 text-lg">{event.description}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-mirage-200 dark:bg-mirage-600 rounded w-1/3 mb-4"></div>
                                        <div className="h-4 bg-mirage-200 dark:bg-mirage-600 rounded w-full mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-mirage-200 dark:bg-mirage-600 rounded w-2/3"></div>
                                            <div className="h-4 bg-mirage-200 dark:bg-mirage-600 rounded w-2/3"></div>
                                            <div className="h-4 bg-mirage-200 dark:bg-mirage-600 rounded w-2/3"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participants Card - Right Side */}
                <div className="flex flex-col bg-white dark:bg-mirage-800 rounded-lg shadow-md w-full md:w-fit md:min-w-[320px] md:max-w-lg max-h-full">
                    {/* Fixed Header */}
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-mirage-700 dark:text-mirage-300">Participants</h2>
                            <span className="bg-mirage-100 dark:bg-mirage-600 text-mirage-800 dark:text-mirage-300 text-sm font-medium px-3 py-1 rounded-full">
                                {participants.length} Registered
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Participants List */}
                    <div className="flex-1 min-h-0">
                        <div className="h-full overflow-y-auto">
                            <div className="p-6">
                                {Array.isArray(participants) && participants.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {participants.map((participant, index) => {
                                            const trophyStyle = getTrophyStyle(index);
                                            return (
                                                <div key={participant._id} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${index < 3 ? 'bg-gradient-to-r from-mirage-200 to-mirage-300' : 'bg-white dark:bg-mirage-700'}`}>
                                                    {/* Profile Picture and Details */}
                                                    <div className="flex items-center space-x-3 flex-1"
                                                        onClick={() => {
                                                            if (participant?.studentId?._id !== decodedToken?.userId) {
                                                                navigate(`/friends/${participant.studentId._id}`);
                                                            }
                                                        }}
                                                    >
                                                        {/* Profile Picture */}
                                                        <img
                                                            src={participant.studentId&&participant.studentId.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'} // Default fallback image
                                                            alt={participant.studentId &&participant.studentId.fullName}
                                                            className="w-12 h-12 rounded-full border border-mirage-300 dark:border-mirage-500"
                                                        />

                                                        {/* Name and Email */}
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-mirage-600 dark:text-mirage-200">
                                                                {participant.studentId &&participant.studentId.fullName}
                                                            </h4>
                                                            <div className="flex items-center space-x-2 text-xs text-mirage-500 dark:text-mirage-400">
                                                                <Mail className="w-4 h-4" />
                                                                <span>{participant.studentId &&participant.studentId.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Trophy and Points with Capsule Background */}
                                                    <div className="flex items-center space-x-2">
                                                        {index < 3 && trophyStyle && (
                                                            <div className="flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium text-mirage-600 dark:text-mirage-200 bg-mirage-100 dark:bg-mirage-600">
                                                                <Trophy color={trophyStyle.color} strokeWidth={trophyStyle.strokeWidth} />
                                                                <span className="ml-2">{participant.pointsGiven}</span> {/* Adding margin-left for spacing */}
                                                            </div>
                                                        )}
                                                    </div>


                                                </div>




                                            );
                                        })}

                                    </div>
                                ) : (
                                    <div className="text-mirage-500 dark:text-mirage-400 text-center">No participants yet</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Button Section */}
                    <div className="p-6 border-t">
                        <button
                            className={`w-full bg-mirage-600 dark:bg-mirage-400 text-white rounded-lg py-2 transition-colors 
        hover:bg-mirage-700 dark:hover:bg-mirage-300 
        ${isParticipated ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleSignUp}
                            disabled={isParticipated}
                        >
                            {isParticipated ? 'Participated' : 'Participate'}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventSignUp;