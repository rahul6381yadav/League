import React from "react";

const EventCardSkeleton = () => {
    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-700/20 to-transparent animate-shimmer"
                style={{ backgroundSize: '200% 100%' }}></div>

            {/* Border simulation */}
            <div className="absolute inset-0 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50"></div>

            {/* Status indicator skeleton */}
            <div className="absolute top-4 right-4 h-6 w-20 bg-gradient-to-r from-indigo-200/40 to-violet-200/40 dark:from-indigo-800/40 dark:to-violet-800/40 rounded-full"></div>

            {/* Content container */}
            <div className="relative z-[1] flex flex-col h-full p-5">
                {/* Header and title */}
                <div className="h-7 bg-gradient-to-r from-indigo-200/60 to-violet-200/60 dark:from-indigo-800/40 dark:to-violet-800/40 rounded w-3/4 mb-4"></div>

                {/* Date stripe */}
                <div className="flex items-center mb-3">
                    <div className="h-6 w-24 bg-gradient-to-r from-indigo-300/60 to-violet-300/60 dark:from-indigo-700/40 dark:to-violet-700/40 rounded mr-2"></div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>

                {/* Description lines */}
                <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6"></div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 mr-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>

                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-violet-100/50 dark:bg-violet-900/30 mr-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>

                    <div className="flex items-center col-span-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100/50 dark:bg-purple-900/30 mr-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                </div>

                {/* Collaborating Clubs Section */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                    <div className="flex flex-wrap gap-2">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="flex items-center h-6 pl-1 pr-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 mr-1"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-14"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to action button skeleton */}
                <div className="mt-auto pt-4">
                    <div className="h-9 w-full bg-gradient-to-r from-indigo-300/60 to-violet-300/60 dark:from-indigo-700/40 dark:to-violet-700/40 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

// Add keyframes for the shimmer effect if not already in your global CSS
const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
`;

// If you need to include the styles directly in the component:
// Uncomment the following:
// const styleSheet = document.createElement("style");
// styleSheet.type = "text/css";
// styleSheet.innerText = shimmerStyles;
// document.head.appendChild(styleSheet);

export default EventCardSkeleton;
