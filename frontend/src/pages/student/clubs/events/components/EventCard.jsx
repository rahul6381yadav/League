import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaChevronRight } from 'react-icons/fa';
import { useRole } from '../../../../../context/RoleContext';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { role } = useRole();

  const handleCardClick = () => {
    const route = role === "coordinator" ? `/events/${event._id}` : `/event-signup/${event._id}`;
    navigate(route);
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col bg-white dark:bg-mirage-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:translate-y-[-4px] cursor-pointer border-l-4 border-mirage-500"
    >
      {/* Event header with gradient background */}
      <div className="bg-gradient-to-r from-mirage-600 to-mirage-400 p-3 text-white">
        <h3 className="font-bold text-lg truncate">{event.eventName}</h3>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Details section */}
        <div>
          <p className="text-sm text-mirage-600 dark:text-mirage-200 mb-3 line-clamp-2">
            {event.description || "No description available"}
          </p>
          
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="flex items-center text-mirage-600 dark:text-mirage-200">
              <FaCalendarAlt className="mr-2 text-mirage-500" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center text-mirage-600 dark:text-mirage-200">
              <FaClock className="mr-2 text-mirage-500" />
              {event.duration}
            </div>
            <div className="flex items-center text-mirage-600 dark:text-mirage-200">
              <FaMapMarkerAlt className="mr-2 text-mirage-500" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center text-mirage-600 dark:text-mirage-200">
              <FaUsers className="mr-2 text-mirage-500" />
              {event.participantsCount || 0}
            </div>
          </div>
        </div>

        {/* Collaborating Clubs Section - only show if there are clubs */}
        {event.clubIds && event.clubIds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-mirage-100 dark:border-mirage-600">
            <h4 className="text-xs font-semibold text-mirage-500 dark:text-mirage-300 mb-2">Collaborating Clubs:</h4>
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {event.clubIds.map((club) => (
                <div key={club._id} className="flex items-center space-x-1 bg-mirage-50 dark:bg-mirage-600 px-2 py-1 rounded-full">
                  <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                    <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs truncate max-w-[80px]">{club.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action indicator */}
      <div className="flex justify-end p-2 bg-mirage-50 dark:bg-mirage-800">
        <span className="text-xs font-medium text-mirage-500 dark:text-mirage-300 flex items-center">
          {role === "coordinator" ? "Manage" : "Join"} 
          <FaChevronRight className="ml-1 text-xs" />
        </span>
      </div>
    </div>
  );
};

export default EventCard;