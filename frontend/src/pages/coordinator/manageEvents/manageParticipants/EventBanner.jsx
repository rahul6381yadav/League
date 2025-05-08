import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaEdit, FaTrophy } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { backendUrl } from "../../../../utils/routes";
import { useNavigate } from 'react-router-dom';

const token = localStorage.getItem("jwtToken");
let decodedToken = null;
if (token) {
    try {
        decodedToken = jwtDecode(token);
    } catch (error) {
        console.error("Error decoding JWT token:", error.message);
    }
}

const EventBanner = (props) => {
    const id = props.props.eventId;
    const [event, setEvent] = useState(null);
    const navigate = useNavigate();
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
        fetchEventDetails();
    }, [id, token]);

    return (
        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden transition-transform hover:shadow-xl">
            {/* Event Banner Image */}
            <div className="relative w-full" style={{ paddingBottom: '40%' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/20">
                    {event && event.photo ? (
                        <img
                            src={event.photo}
                            alt="Event Banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center">
                            <div className="text-center">
                                <FaTrophy className="text-white/80 text-6xl mb-4 animate-pulse" />
                                <h3 className="text-white text-xl font-bold tracking-wider">{event?.eventName || "LEAGUE EVENT"}</h3>
                               
                            </div>
                        </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                    {/* Edit Button */}
                    {event && (
                        <button
                            onClick={() => navigate(`/events/edit/${event._id}`)}
                            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all hover:scale-105 active:scale-95 group"
                        >
                            <FaEdit className="text-lg group-hover:text-indigo-200" />
                        </button>
                    )}
                </div>
            </div>

            {/* Event Details */}
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
                                    <span className="text-gray-500 dark:text-gray-400 text-xs block">Date</span>
                                    <span>{new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
                                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                                    {event.description}
                                </p>
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
                        <div className="h-16 bg-indigo-200/50 dark:bg-indigo-800/30 rounded w-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventBanner;