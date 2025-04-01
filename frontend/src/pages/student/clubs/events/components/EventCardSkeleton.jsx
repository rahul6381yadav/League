import React from "react";

const EventCardSkeleton = () => {
    return (
        <div
            className="p-4 border rounded-lg shadow-md bg-gradient-to-br from-mirage-200 to-mirage-300 dark:bg-gradient-to-br dark:from-mirage-800 dark:to-mirage-600 animate-pulse"
        >
            <div className="flex-1">
                <div className="h-6 bg-mirage-400 dark:bg-mirage-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-5/6 mb-4"></div>
                <div className="mt-2 space-y-2">
                    <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-1/2"></div>
                    <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-2/3"></div>
                    <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-1/3"></div>
                    <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-1/4"></div>
                </div>

                {/* Collaborating Clubs Section */}
                <div className="mt-4">
                    <div className="h-4 bg-mirage-400 dark:bg-mirage-700 rounded w-1/3 mb-2"></div>
                    <div className="flex flex-wrap gap-4">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="text-center">
                                <div className="w-12 h-12 bg-mirage-300 dark:bg-mirage-600 rounded-full mb-2"></div>
                                <div className="h-3 bg-mirage-300 dark:bg-mirage-600 rounded w-10 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCardSkeleton;
