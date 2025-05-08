import React, { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaTimes, FaFilter } from 'react-icons/fa';

const EventFilters = ({ setFilters }) => {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setFilters(prev => ({ ...prev, date: e.target.value }));
  };

  const clearFilters = () => {
    setSearch('');
    setDate('');
    setFilters({});
  };

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  return (
    <div className="mb-4">
      {/* Desktop view - show all filters inline */}
      <div className="hidden md:flex items-center space-x-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mirage-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-mirage-200 dark:border-mirage-600 rounded-full bg-white dark:bg-mirage-700 focus:outline-none focus:ring-2 focus:ring-mirage-500 text-mirage-800 dark:text-mirage-50"
          />
        </div>
        
        <div className="relative w-48">
          <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mirage-400" />
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="w-full pl-10 pr-4 py-2 border border-mirage-200 dark:border-mirage-600 rounded-full bg-white dark:bg-mirage-700 focus:outline-none focus:ring-2 focus:ring-mirage-500 text-mirage-800 dark:text-mirage-50"
          />
        </div>
        
        {(search || date) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-mirage-100 dark:bg-mirage-700 text-mirage-600 dark:text-mirage-300 rounded-full hover:bg-mirage-200 dark:hover:bg-mirage-600 flex items-center gap-2"
          >
            <FaTimes size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Mobile view - collapsible filter menu */}
      <div className="md:hidden">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mirage-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-mirage-200 dark:border-mirage-600 rounded-full bg-white dark:bg-mirage-700 focus:outline-none focus:ring-2 focus:ring-mirage-500 text-mirage-800 dark:text-mirage-50"
            />
          </div>
          
          <button
            onClick={toggleFilterMenu}
            className={`p-2 ${isFilterMenuOpen ? 'bg-mirage-500 text-white' : 'bg-mirage-100 dark:bg-mirage-700 text-mirage-600 dark:text-mirage-300'} rounded-full hover:bg-mirage-500 hover:text-white transition-colors`}
            aria-label="Toggle filters"
          >
            <FaFilter size={14} />
          </button>
          
          {(search || date) && (
            <button
              onClick={clearFilters}
              className="p-2 bg-mirage-100 dark:bg-mirage-700 text-mirage-600 dark:text-mirage-300 rounded-full hover:bg-mirage-200 dark:hover:bg-mirage-600"
              aria-label="Clear filters"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
        
        {/* Collapsible date filter */}
        {isFilterMenuOpen && (
          <div className="mt-2 p-3 bg-white dark:bg-mirage-700 rounded-lg shadow-md border border-mirage-200 dark:border-mirage-600">
            <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-1">Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mirage-400" />
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="w-full pl-10 pr-4 py-2 border border-mirage-200 dark:border-mirage-600 rounded-lg bg-white dark:bg-mirage-700 focus:outline-none focus:ring-2 focus:ring-mirage-500 text-mirage-800 dark:text-mirage-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFilters;