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

  // Format time from date
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-indigo-100 dark:border-violet-900/30 flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Color accent top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-violet-500"></div>

      {/* Content container */}
      <div className="flex flex-col h-full">
        {/* Event header */}
        <div className="p-5 pb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{event.eventName}</h3>

          {/* Date and time info */}
          <div className="flex items-center mb-3 text-sm text-gray-700 dark:text-gray-300">
            <FaCalendarAlt className="text-indigo-500 dark:text-indigo-400 mr-2" />
            <span className="font-medium">{formatDate(event.date)}</span>
            <span className="mx-2">•</span>
            <span>{formatTime(event.date)}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {event.description || "No description available"}
          </p>
        </div>

        {/* Details grid */}
        <div className="px-5 grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <div className="w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
              <FaClock className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <span>{event.duration}</span>
          </div>

          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <div className="w-7 h-7 rounded-md bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mr-3">
              <FaMapMarkerAlt className="text-violet-500 dark:text-violet-400" />
            </div>
            <span className="truncate">{event.venue}</span>
          </div>

          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
              <FaUsers className="text-purple-500 dark:text-purple-400" />
            </div>
            <span>{event.participantsCount || 0} participants</span>
          </div>
        </div>

        {/* Collaborating Clubs Section */}
        {event.clubIds && event.clubIds.length > 0 && (
          <div className="px-5 mt-3">
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Collaborating with:</h4>
              <div className="flex flex-wrap gap-1">
                {event.clubIds.map((club) => (
                  <div key={club._id} className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    {club.image && (
                      <img
                        src={club.image}
                        alt=""
                        className="w-3 h-3 rounded-full mr-1"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <span className="text-xs truncate max-w-[80px] text-gray-700 dark:text-gray-300">{club.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call to action */}
        <div className="mt-auto p-4 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
              {role === "coordinator" ? "Manage participants" : "View event details"}
            </span>
            <button className="py-1.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm flex items-center transition-colors">
              {role === "coordinator" ? "Manage" : "View"}
              <FaChevronRight className="ml-1.5 text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;