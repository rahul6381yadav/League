import React from "react";

const EventCardSkeleton = () => {
    return (
        <div className="p-4 border rounded-lg shadow-md bg-gradient-to-br from-mirage-200 to-mirage-300 dark:bg-gradient-to-br dark:from-mirage-800 dark:to-mirage-600 animate-pulse w-full sm:w-1/2 lg:w-1/3 xl:w-1/4">
            <div className="flex-1">
                {/* Title Skeleton */}
                <div className="h-6 bg-mirage-400 dark:bg-mirage-700 rounded w-3/4 mb-2"></div>
                {/* Description Skeleton */}
                <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-full mb-4"></div>
                {/* Metadata Skeleton */}
                <div className="space-y-3">
                    <div className="flex items-center">
                        <div className="h-4 w-4 bg-mirage-400 dark:bg-mirage-700 rounded-full mr-2"></div>
                        <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-1/3"></div>
                    </div>
                    <div className="flex items-center">
                        <div className="h-4 w-4 bg-mirage-400 dark:bg-mirage-700 rounded-full mr-2"></div>
                        <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-1/2"></div>
                    </div>
                    <div className="flex items-center">
                        <div className="h-4 w-4 bg-mirage-400 dark:bg-mirage-700 rounded-full mr-2"></div>
                        <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-1/4"></div>
                    </div>
                    <div className="flex items-center">
                        <div className="h-4 w-4 bg-mirage-400 dark:bg-mirage-700 rounded-full mr-2"></div>
                        <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-1/3"></div>
                    </div>
                </div>
                {/* Collaborating Clubs Skeleton */}
                <div className="mt-4">
                    <div className="h-4 bg-mirage-400 dark:bg-mirage-700 rounded w-1/3 mb-2"></div>
                    <div className="flex flex-wrap gap-4">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="text-center">
                                <div className="w-12 h-12 bg-mirage-400 dark:bg-mirage-700 rounded-full mb-2"></div>
                                <div className="h-4 bg-mirage-300 dark:bg-mirage-600 rounded w-10"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCardSkeleton;
