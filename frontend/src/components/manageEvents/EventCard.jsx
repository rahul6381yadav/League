import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers } from 'react-icons/fa';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div
      className="p-4 border rounded-lg shadow-md bg-gradient-to-br from-pink-100 to-purple-300 dark:bg-gradient-to-br dark:from-purple-100 dark:to-blue-400  transform transition-all duration-200 hover:scale-105"
      onClick={() => navigate(`/events/${event._id}`)}
    >
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-blue-600 truncate">{event.eventName}</h3>
        <p className="text-sm text-gray-600 truncate">
          {event.description || 'No description available'}
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center text-gray-600 text-sm">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FaMapMarkerAlt className="mr-2 text-red-500" />
            {event.vanue}
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
      </div>
    </div>
  );
};

export default EventCard;