import React from 'react';
import { FaCalendarPlus, FaSearch, FaCalendarAlt, FaFilter } from 'react-icons/fa';

const EmptyState = ({ loading, hasFilters, onCreateEvent, onClearFilters }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        {/* Loading animation with gradient colors */}
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 opacity-20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-violet-500 border-b-indigo-600 border-l-violet-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaCalendarAlt className="text-2xl text-indigo-600 dark:text-violet-400" />
          </div>
        </div>

        <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
          Loading events
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mt-2 text-center max-w-xs">
          Please wait while we fetch your events
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Main container with soft shadow and gradient border */}
      <div className="relative p-[1px] rounded-2xl shadow-xl max-w-md w-full">
        {/* Gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 animate-pulse-slow"></div>

        {/* Inner content */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/20 rounded-full -translate-x-16 -translate-y-32 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-100 dark:bg-violet-900/20 rounded-full -translate-x-20 translate-y-10 opacity-20"></div>

          {hasFilters ? (
            <div className="relative z-10 text-center">
              {/* Search illustration with animated gradient */}
              <div className="mx-auto w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40"></div>
                <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                  <div className="relative">
                    <FaSearch className="text-3xl text-indigo-600 dark:text-violet-400" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-3">
                No matching events
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                We couldn't find any events matching your current filters. Try adjusting your search or create something new.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={onClearFilters}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center hover:shadow-md transition-all group"
                >
                  <FaFilter className="mr-2 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Clear Filters</span>
                </button>

                {onCreateEvent && (
                  <button
                    onClick={onCreateEvent}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full flex items-center shadow-md hover:shadow-lg transition-all group"
                  >
                    <FaCalendarPlus className="mr-2 group-hover:scale-110 transition-transform" />
                    <span>Create Event</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative z-10 text-center">
              {/* Empty calendar illustration with animated elements */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 transform rotate-6"></div>
                <div className="absolute inset-1 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center transform rotate-6">
                  <FaCalendarAlt className="text-4xl text-indigo-200 dark:text-indigo-900/50" />
                </div>
                <div className="absolute inset-0 rounded-xl border-2 border-indigo-500 dark:border-violet-500 flex items-center justify-center">
                  <div className="w-full h-full flex flex-col">
                    <div className="h-6 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-lg flex items-center justify-center">
                      <div className="w-8 h-1 bg-white/70 rounded"></div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <FaCalendarPlus className="text-3xl text-indigo-600 dark:text-violet-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-3">
                No events yet
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                Get started by creating your first event. Events help you engage with your community and track participation.
              </p>

              {onCreateEvent && (
                <button
                  onClick={onCreateEvent}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full flex items-center justify-center mx-auto shadow-md hover:shadow-lg transition-all group"
                >
                  <FaCalendarPlus className="mr-2 group-hover:rotate-12 transition-transform" />
                  <span className="font-medium">Create Your First Event</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add default props for optional functions to prevent errors
EmptyState.defaultProps = {
  onCreateEvent: () => { },
  onClearFilters: () => { }
};

export default EmptyState;