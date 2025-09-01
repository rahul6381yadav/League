import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaChevronRight } from 'react-icons/fa';
import { useRole } from '../../../../../context/RoleContext';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { role } = useRole();
  const isTeamEvent = event.maxMember > 1;

  const handleClick = () => {
    if (isTeamEvent) {
      navigate(`/team-event/${event._id}`);
    } else {
      navigate(`/event-signup/${event._id}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDate(event.date);

  return (
    <div
      onClick={handleClick}
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer group hover:-translate-y-0.5"
    >
      {/* Gradient accent */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500"></div>
      
      {/* Team event badge */}
      {isTeamEvent && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Team
        </div>
      )}

      <div className="p-4 flex flex-col justify-between">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {event.eventName}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {event.description || "No description available"}
          </p>
        </div>

        {/* Compact info grid */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FaCalendarAlt className="text-indigo-500 w-3 h-3 mr-2" />
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <FaClock className="w-3 h-3 mr-1" />
              <span>{time}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-700 dark:text-gray-300 flex-1 min-w-0">
              <FaMapMarkerAlt className="text-violet-500 w-3 h-3 mr-2 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 ml-3">
              <FaUsers className="w-3 h-3 mr-1" />
              <span>{event.participantsCount || 0}</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {event.duration}
            </span>
          </div>
        </div>

        {/* Collaborating clubs - more compact */}
        {event.clubIds && event.clubIds.length > 0 && (
          <div className="mb-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">With:</span>
              {event.clubIds.slice(0, 3).map((club) => (
                <div key={club._id} className="inline-flex items-center px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                  {club.image && (
                    <img
                      src={club.image}
                      alt=""
                      className="w-3 h-3 rounded-full mr-1"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <span className="text-gray-700 dark:text-gray-300 max-w-[60px] truncate">
                    {club.name}
                  </span>
                </div>
              ))}
              {event.clubIds.length > 3 && (
                <span className="text-xs text-gray-400">+{event.clubIds.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Action button */}
        <button className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-sm font-medium flex items-center justify-center transition-all duration-200 group/btn">
          <span>{role === "coordinator" ? "Manage Event" : "View Details"}</span>
          <FaChevronRight className="ml-2 w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;