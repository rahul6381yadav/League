import React, { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaTimes, FaFilter, FaSlidersH } from 'react-icons/fa';

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
    <div className="mb-6">
      {/* Desktop view with indigo/violet color scheme */}
      <div className="hidden md:flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-indigo-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-violet-900/30 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-violet-500 text-gray-700 dark:text-gray-200 transition-all"
          />
        </div>

        <div className="relative w-60">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaCalendarAlt className="text-violet-400" />
          </div>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-violet-900/30 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-violet-500 text-gray-700 dark:text-gray-200 transition-all"
          />
        </div>

        {(search || date) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-violet-900/30 rounded-lg text-indigo-600 dark:text-violet-400 hover:bg-indigo-50 dark:hover:bg-violet-900/10 flex items-center gap-2 transition-colors shadow-sm"
          >
            <FaTimes size={12} />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* Mobile view with dropdown - compact and modern */}
      <div className="md:hidden">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-indigo-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-violet-900/30 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-violet-500 text-gray-700 dark:text-gray-200 transition-all"
            />
          </div>

          <button
            onClick={toggleFilterMenu}
            className={`p-2.5 rounded-lg shadow-sm border ${isFilterMenuOpen
                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-violet-600 dark:border-violet-600'
                : 'bg-white text-indigo-600 border-indigo-200 dark:bg-gray-800 dark:text-violet-400 dark:border-violet-900/30'
              } hover:shadow-md transition-all duration-200`}
            aria-label="Toggle filters"
          >
            <FaSlidersH size={16} />
          </button>

          {(search || date) && (
            <button
              onClick={clearFilters}
              className="p-2.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-violet-900/30 rounded-lg text-indigo-600 dark:text-violet-400 hover:bg-indigo-50 dark:hover:bg-violet-900/10 transition-colors shadow-sm"
              aria-label="Clear filters"
            >
              <FaTimes size={16} />
            </button>
          )}
        </div>

        {/* Collapsible filter panel */}
        {isFilterMenuOpen && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-indigo-100 dark:border-violet-900/20 animate-fade-in">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-violet-400" />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={handleDateChange}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-violet-900/30 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-violet-500 text-gray-700 dark:text-gray-200 transition-all"
                  />
                </div>
              </div>

              {/* Apply filters button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="py-2 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-md shadow-sm text-sm font-medium transition-all"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current filter indicators/tags */}
      {(search || date) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {search && (
            <div className="inline-flex items-center py-1 px-3 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              <span>Search: {search}</span>
              <button onClick={() => {
                setSearch('');
                setFilters(prev => {
                  const newFilters = { ...prev };
                  delete newFilters.search;
                  return newFilters;
                });
              }} className="ml-1.5 hover:text-indigo-500">
                <FaTimes size={10} />
              </button>
            </div>
          )}

          {date && (
            <div className="inline-flex items-center py-1 px-3 rounded-full text-xs bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
              <span>Date: {new Date(date).toLocaleDateString()}</span>
              <button onClick={() => {
                setDate('');
                setFilters(prev => {
                  const newFilters = { ...prev };
                  delete newFilters.date;
                  return newFilters;
                });
              }} className="ml-1.5 hover:text-violet-500">
                <FaTimes size={10} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EventFilters;