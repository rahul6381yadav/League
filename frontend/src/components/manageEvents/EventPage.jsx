import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from './EventCard';
import EventFilters from './EventFilter';
import Pagination from './Pagination';
import { FaTh, FaList } from 'react-icons/fa';

const EventPage = () => {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ limit: 6, skip: 0 });

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

  return (
    <div className="text-gray-900 min-h-screen flex flex-col">
      <div className="container mx-auto p-4 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray dark:text-white text-center flex-1">ALL EVENTS</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 flex items-center space-x-1 rounded-md shadow-md ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              <FaTh />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 flex items-center space-x-1 rounded-md shadow-md ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              <FaList />
              <span>List</span>
            </button>
          </div>
        </div>
        <EventFilters setFilters={setFilters} />
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredEvents.length > 0 ? (
            filteredEvents.slice(pagination.skip, pagination.skip + pagination.limit).map((event) => (
              <EventCard key={event.id} event={event} viewMode={viewMode} />
            ))
          ) : (
            <p className="text-center text-gray-800 font-semibold dark:text-white">
              No events found for the selected filters.
            </p>
          )}
        </div>
      </div>

      <Pagination pagination={pagination} setPagination={setPagination} />
    </div>
  );
};

export default EventPage;