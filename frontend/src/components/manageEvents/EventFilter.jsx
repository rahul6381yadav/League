import React, { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaTimes } from 'react-icons/fa';

const EventFilters = ({ setFilters }) => {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const applyFilters = () => {
    setFilters({ search, date });
  };

  const clearFilters = () => {
    setSearch('');
    setDate('');
    setFilters({ search: '', date: '' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 flex flex-col md:flex-row md:space-x-4">
      <div className="flex-grow mb-2 md:mb-0">
        <div className="relative">
          <FaSearch className="absolute left-3 top-2 text-gray-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
      <div className="flex-grow mb-2 md:mb-0">
        <div className="relative">
          <FaCalendarAlt className="absolute left-3 top-2 text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-10 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-2">
        <button
          onClick={applyFilters}
          className="w-full md:w-auto p-2 bg-blue-500 text-white rounded flex items-center space-x-2 shadow-md hover:bg-blue-600 transition mb-2 md:mb-0"
        >
          <FaSearch />
          <span>Apply</span>
        </button>
        <button
          onClick={clearFilters}
          className="w-full md:w-auto p-2 bg-red-500 text-white rounded flex items-center space-x-2 shadow-md hover:bg-red-600 transition"
        >
          <FaTimes />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};

export default EventFilters;