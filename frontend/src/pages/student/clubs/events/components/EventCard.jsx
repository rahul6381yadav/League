import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { useRole } from "../../../../../context/RoleContext"; // Import the useRole hook

const EventCard = ({ event }) => {
    const navigate = useNavigate();
    const { role } = useRole();

    const handleCardClick = () => {
        const route = role === "coordinator" ? `/events/${event._id}` : `/event-signup/${event._id}`;
        navigate(route);  // Navigate to the appropriate route based on the role
    };

    return (
        <div
            className="p-4 border rounded-lg shadow-md bg-gradient-to-br from-mirage-200 to-mirage-300 dark:bg-gradient-to-br dark:from-mirage-800 dark:to-mirage-600 transform transition-all duration-200 hover:scale-105 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-mirage-700 dark:text-mirage-100 truncate">{event.eventName}</h3>
                <p className="text-sm text-mirage-600 dark:text-mirage-200 truncate">
                    {event.description || "No description available"}
                </p>
                <div className="mt-2 space-y-1">
                    <div className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                        <FaCalendarAlt className="mr-2 text-mirage-500"/>
                        {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                        <FaMapMarkerAlt className="mr-2 text-mirage-500"/>
                        {event.venue}
                    </div>
                    <div className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                        <FaClock className="mr-2 text-mirage-500"/>
                        {event.duration}
                    </div>
                    <div className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                        <FaUsers className="mr-2 text-mirage-500"/>
                        Participants: {event.participantsCount || 0}
                    </div>
                </div>

                {/* Collaborating Clubs Section */}
                {event.clubIds && event.clubIds.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-semibold text-mirage-700 dark:text-mirage-100 mb-2">Collaborating Clubs:</h4>
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
            </div>
        </div>
    );
};

export default EventCard;
