import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {useAuth} from "../../../../../context/AuthContext";
import {FaCalendarAlt, FaClock, FaMapMarkerAlt} from "react-icons/fa"; // Import icons
import {Mail, Trophy} from "lucide-react";

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
    const {id} = useParams();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isParticipated, setIsParticipated] = useState(false);
    const {userId, isAuthenticated} = useAuth();
    const token = localStorage.getItem("jwtToken");

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/v1/club/events`, {
                    params: {id},
                    headers: {Authorization: `Bearer ${token}`},
                });
                setEvent(response.data.event);
                console.log("Event details:", response.data.event);
            } catch (error) {
                console.error("Error fetching event details:", error.response?.data || error.message);
            }
        };

        const getParticipants = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/v1/club/attendance`, {
                    headers: {Authorization: `Bearer ${token}`},
                    params: {eventId: id},
                });
                console.log("Participants:", response.data.records);
                const sortedParticipants = response.data.records.sort((a, b) => b.pointsGiven - a.pointsGiven);
                setParticipants(sortedParticipants);
            } catch (error) {
                console.error("Error fetching participants:", error.response?.data || error.message);
            }
        };

        const checkParticipation = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/v1/club/attendance`, {
                    headers: {Authorization: `Bearer ${token}`},
                    params: {studentId: userId, eventId: id},
                });
                const records = Array.isArray(response.data.records) ? response.data.records : [];
                setIsParticipated(records.length > 0);
            } catch (error) {
                console.error("Error checking participation:", error.response?.data || error.message);
            }
        };

        fetchEventDetails();
        getParticipants();
        if (isAuthenticated) {
            checkParticipation();
        }
    }, [id, isAuthenticated, userId, token]);

    const handleSignUp = async () => {
        if (!isParticipated && isAuthenticated) {
            try {
                await axios.post(
                    `http://localhost:4000/api/v1/club/attendance`,
                    {
                        studentId: userId,
                        eventId: id,
                        pointsGiven: 0,
                        status: "Present",
                        isWinner: false,
                    },
                    {
                        headers: {Authorization: `Bearer ${token}`},
                    }
                );
                setIsParticipated(true);
                const response = await axios.get(`http://localhost:4000/api/v1/club/attendance`, {
                    headers: {Authorization: `Bearer ${token}`},
                    params: {eventId: id},
                });
                const sortedParticipants = response.data.records.sort((a, b) => b.pointsGiven - a.pointsGiven);
                setParticipants(sortedParticipants);
                alert("Successfully signed up for the event!");
            } catch (error) {
                console.error("Error signing up:", error.response?.data || error.message);
                alert("Failed to sign up for the event.");
            }
        }
    };

    return (
        <div className="h-screen w-full flex">
            <div className="h-full w-full grid grid-cols-1 md:grid-cols-[1fr,auto] gap-8 p-8">
                {/* Event Details Card - Left Side */}
                <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="relative w-full" style={{paddingBottom: '42.8571%'}}>
                        <div
                            className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">Banner Placeholder</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            {event ? (
                                <>
                                    <h1 className="text-3xl font-bold text-purple-600 mb-4">{event.eventName}</h1>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center text-gray-600 dark:text-white text-sm">
                                                <FaCalendarAlt className="mr-2 text-purple-500"/>
                                                <span className="mr-2">Date:</span>
                                                {new Date(event.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center text-gray-600 dark:text-white text-sm">
                                                <FaMapMarkerAlt className="mr-2 text-red-500"/>
                                                <span className="mr-2">Venue:</span>
                                                {event.venue}
                                            </div>
                                            <div className="flex items-center text-gray-600 dark:text-white text-sm">
                                                <FaClock className="mr-2 text-green-500"/>
                                                <span className="mr-2">Duration:</span>
                                                {event.duration}
                                            </div>
                                        </div>
                                        {/* Collaborating Clubs Section */}
                                        {event.clubIds && event.clubIds.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">Collaborating
                                                    Clubs:</h4>
                                                <div className="flex flex-wrap gap-4">
                                                    {event.clubIds.map((club) => (
                                                        <div key={club._id} className="text-center">
                                                            <img
                                                                src={club.image}
                                                                alt={club.name}
                                                                className="w-12 h-12 rounded-full border border-gray-300"
                                                            />
                                                            <p className="text-xs text-gray-600 dark:text-white mt-1">{club.name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-gray-700 dark:text-white text-lg">{event.description}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Participants Card - Right Side */}
                <div
                    className="h-full w-full md:w-fit md:min-w-[320px] md:max-w-lg flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">Participants</h2>
                            <span
                                className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium px-3 py-1 rounded-full">
                                {participants.length} Registered
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            {Array.isArray(participants) && participants.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {participants.map((participant, index) => {
                                        const trophyStyle = getTrophyStyle(index);

                                        return (
                                            <div
                                                key={participant._id}
                                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                                    index < 3
                                                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="relative">
                                                    {participant.studentId?.photo ? (
                                                        <img
                                                            src={participant.studentId.photo}
                                                            alt={participant.studentId.fullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                                                            <span className="text-purple-700 font-medium">
                                                                {participant.studentId?.fullName?.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-gray-800 font-medium">
                                                        {participant.studentId?.fullName}
                                                    </span>
                                                    <div className="flex items-center text-gray-500 text-sm">
                                                        <Mail className="w-3 h-3 mr-1"/>
                                                        {participant.studentId?.email}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`flex items-center justify-center rounded-full px-3 py-1 ${
                                                        index < 3 ? 'bg-white bg-opacity-50' : 'bg-purple-50'
                                                    }`}>
                                                    {trophyStyle && participant.pointsGiven > 0 && (
                                                        <div className="flex items-center">
                                                            <Trophy
                                                                color={trophyStyle.color}
                                                                className={`${trophyStyle.size} drop-shadow-md`}
                                                                strokeWidth={trophyStyle.strokeWidth}
                                                            />
                                                            <span className="text-xs font-bold ml-1"
                                                                  style={{color: trophyStyle.color}}>
                                                                {trophyStyle.label}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="text-purple-700 font-medium ml-2">
                                                        {participant.pointsGiven} pts
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No participants yet. Be the first to sign
                                    up!</p>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t mt-auto">
                        <button
                            className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${
                                isParticipated
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                    : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                            onClick={handleSignUp}
                            disabled={isParticipated}
                        >
                            {isParticipated ? "Participated" : "Participate"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventSignUp;
