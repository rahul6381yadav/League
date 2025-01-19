import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers } from "react-icons/fa";
import { useRole } from "../../context/RoleContext";  // Import the useRole hook

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { roles } = useRole(); 

  const handleCardClick = () => {
    const route = roles === "coordinator" ? `/events/${event._id}` : `/event-signup/${event._id}`;
    navigate(route);  // Navigate to the appropriate route based on the role
  };

  return (
      <div
          className="p-4 border rounded-lg shadow-md bg-gradient-to-br from-pink-100 to-purple-300 dark:bg-gradient-to-br dark:from-purple-100 dark:to-blue-400 transform transition-all duration-200 hover:scale-105 cursor-pointer"
          onClick={handleCardClick}
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-600 truncate">{event.eventName}</h3>
          <p className="text-sm text-gray-600 truncate">
            {event.description || "No description available"}
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-gray-600 text-sm">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <FaMapMarkerAlt className="mr-2 text-red-500" />
              {event.venue}
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <FaClock className="mr-2 text-green-500" />
              {event.duration}
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <FaUsers className="mr-2 text-purple-500" />
              Participants: {event.participantsCount || 0}
            </div>
          </div>

          {/* Collaborating Clubs Section */}
          {event.clubIds && event.clubIds.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Collaborating Clubs:</h4>
                <div className="flex flex-wrap gap-4">
                  {event.clubIds.map((club) => (
                      <div key={club._id} className="text-center">
                        <img
                            src={club.image}
                            alt={club.name}
                            className="w-12 h-12 rounded-full border border-gray-300"
                        />
                        <p className="text-xs text-gray-600 mt-1">{club.name}</p>
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
