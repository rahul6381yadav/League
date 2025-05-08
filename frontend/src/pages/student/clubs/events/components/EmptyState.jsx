import React from 'react';
import { FaCalendarPlus, FaSearch, FaCalendarAlt } from 'react-icons/fa';

const EmptyState = ({ loading, hasFilters, onCreateEvent }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-t-4 border-mirage-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-mirage-200 dark:border-mirage-600 rounded-full"></div>
        </div>
        <h3 className="text-xl font-semibold text-mirage-700 dark:text-mirage-100">
          Loading events
        </h3>
        <p className="text-mirage-500 dark:text-mirage-300 mt-2">
          Please wait while we fetch your events
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-white dark:bg-mirage-700 p-8 rounded-lg shadow-lg text-center max-w-md">
        {hasFilters ? (
          <>
            <div className="mx-auto w-16 h-16 bg-mirage-100 dark:bg-mirage-600 rounded-full flex items-center justify-center mb-4">
              <FaSearch className="text-mirage-500 dark:text-mirage-300 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-mirage-700 dark:text-mirage-100 mb-2">
              No matching events found
            </h3>
            <p className="text-mirage-500 dark:text-mirage-300 mb-4">
              Try adjusting your search filters or create a new event.
            </p>
            <div className="flex justify-center">
              <button
                className="px-4 py-2 bg-mirage-100 dark:bg-mirage-600 text-mirage-600 dark:text-mirage-200 rounded-full mx-2 hover:bg-mirage-200 dark:hover:bg-mirage-500 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={onCreateEvent}
                className="px-4 py-2 bg-mirage-600 text-white rounded-full mx-2 hover:bg-mirage-500 transition-colors"
              >
                Create Event
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto w-20 h-20 bg-mirage-100 dark:bg-mirage-600 rounded-full flex items-center justify-center mb-4">
              <FaCalendarPlus className="text-mirage-500 dark:text-mirage-300 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-mirage-700 dark:text-mirage-100 mb-2">
              No events yet
            </h3>
            <p className="text-mirage-500 dark:text-mirage-300 mb-6">
              Get started by creating your first event. Events help you engage with your community and track participation.
            </p>
            <button
              onClick={onCreateEvent}
              className="px-6 py-2 bg-mirage-600 text-white rounded-full flex items-center justify-center mx-auto hover:bg-mirage-500 transition-colors"
            >
              <FaCalendarPlus className="mr-2" />
              Create Your First Event
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmptyState;