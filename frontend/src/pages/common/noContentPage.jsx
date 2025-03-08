import React from 'react';
import { Link } from 'react-router-dom';

const NoContentPage = () => {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-mirage-50 dark:bg-mirage-900">
            <div className="text-center p-8">
                <img
                    src="/Searching-Owl.png"
                    alt="No events found"
                    className="mx-auto mb-6 max-w-xs w-full h-auto"
                />
                <h2 className="text-2xl font-bold text-mirage-700 dark:text-mirage-100 mb-4">
                    No Events Found
                </h2>
                <p className="text-mirage-600 dark:text-mirage-400 mb-6">
                    It looks like you haven't participated in any events yet.
                </p>
                <Link
                    to="/all-events"
                    className="px-6 py-3 bg-mirage-600 dark:bg-mirage-400 text-white rounded-lg hover:bg-mirage-700 dark:hover:bg-mirage-300 transition-colors"
                >
                    Explore Events
                </Link>
            </div>
        </div>
    );
};

export default NoContentPage;