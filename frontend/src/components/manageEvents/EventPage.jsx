import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from './EventCard';
import EventFilters from './EventFilter';
import Pagination from './Pagination';
import CreateEvents from '../club_page/CreateEvents';
import { FaPlus } from 'react-icons/fa';

const EventPage = () => {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ limit: 6, skip: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null); // For updating an event
  const [primaryClubId, setPrimaryClubId] = useState(''); // Set this to your primary club ID
  const [primaryClubName, setPrimaryClubName] = useState(''); // Set this to your primary club name

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error('No auth token found. Please log in.');
        return;
      }
      const { limit, skip } = pagination;
      const response = await axios.get('http://localhost:4000/api/v1/club/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { limit, skip },
      });
      if (response.data && response.data.events) {
        setEvents(response.data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err.response || err.message);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [pagination]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = filters.search
      ? event.eventName.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    const matchesDate = filters.date
      ? new Date(event.date).toISOString().split('T')[0] === filters.date
      : true;

    return matchesSearch && matchesDate;
  });

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:4000/api/v1/club/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchEvents(); 
    } catch (err) {
      console.error('Error deleting event:', err.response || err.message);
    }
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="text-gray-900 min-h-screen flex flex-col">
      <div className="container mx-auto p-4 flex-grow">
        <h1 className="text-3xl font-bold text-gray dark:text-white text-center mb-4">ALL EVENTS</h1>
        <EventFilters setFilters={setFilters} />
        <button
          onClick={() => {
            setCurrentEvent(null); 
            setIsModalOpen(true);
          }}
          className="mb-4 p-2 bg-green-500 text-white rounded flex items-center space-x-2 shadow-md hover:bg-green-600 transition"
        >
          <FaPlus />
          <span>Create Event</span>
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.slice(pagination.skip, pagination.skip + pagination.limit).map((event) => (
              <EventCard 
                key={event.id} 
                event={event } 
                onEdit={handleEditEvent} 
                onDelete={handleDeleteEvent} 
              />
            ))
          ) : (
            <p className="text-center text-gray-800 font-semibold dark:text-white">
              No events found for the selected filters.
            </p>
          )}
        </div>
      </div>

      <Pagination pagination={pagination} setPagination={setPagination} />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black opacity-50 absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-lg shadow-lg z-10 p-6">
            <CreateEvents 
              primaryClubId={primaryClubId} 
              primaryClubName={primaryClubName} 
              currentEvent={currentEvent} 
              onClose={() => {
                setIsModalOpen(false);
                setCurrentEvent(null); 
                fetchEvents(); // Refresh events after creating/updating
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPage;