// components/common/Loader.js
import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <div
                    className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
                    Authenticating, please wait...
                </p>
            </div>
        </div>
    );
};

export default Loader;
