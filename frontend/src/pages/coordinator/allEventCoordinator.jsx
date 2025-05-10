import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../../utils/routes";
import { format, isAfter, isBefore, isToday } from "date-fns";

const AllEventCoordinator = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, upcoming, ongoing, past
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("dateNewest");
    const token = localStorage.getItem("jwtToken");

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvents(response.data.events || []);
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [token]);

    const getEventStatus = (event) => {
        const now = new Date();
        const startDate = new Date(event.date);
        const endDate = new Date(event.endDate || startDate.getTime() + (event.duration ? parseInt(event.duration) * 60 * 60 * 1000 : 7200000));

        if (isAfter(now, startDate) && isBefore(now, endDate)) {
            return "ongoing";
        } else if (isAfter(now, endDate)) {
            return "past";
        } else {
            return "upcoming";
        }
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case "ongoing":
                return {
                    label: "Ongoing",
                    colorClass: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                    dotClass: "bg-green-500"
                };
            case "past":
                return {
                    label: "Past",
                    colorClass: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
                    dotClass: "bg-gray-500"
                };
            case "upcoming":
                return {
                    label: "Upcoming",
                    colorClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
                    dotClass: "bg-indigo-500"
                };
            default:
                return {
                    label: "Unknown",
                    colorClass: "bg-gray-100 text-gray-800",
                    dotClass: "bg-gray-500"
                };
        }
    };

    const filteredEvents = events
        .filter((event) => {
            if (filter === "all") return true;
            return getEventStatus(event) === filter;
        })
        .filter((event) => {
            if (!searchTerm.trim()) return true;
            return (
                event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        })
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            switch (sortBy) {
                case "dateNewest":
                    return dateB - dateA;
                case "dateOldest":
                    return dateA - dateB;
                case "nameAZ":
                    return (a.name || "").localeCompare(b.name || "");
                case "nameZA":
                    return (b.name || "").localeCompare(a.name || "");
                default:
                    return dateB - dateA;
            }
        });

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, "MMM dd, yyyy • h:mm a");
        } catch {
            return "Invalid date";
        }
    };

    const eventCounts = {
        total: events.length,
        upcoming: events.filter(event => getEventStatus(event) === "upcoming").length,
        ongoing: events.filter(event => getEventStatus(event) === "ongoing").length,
        past: events.filter(event => getEventStatus(event) === "past").length,
    };

    return (
        <div className="max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-indigo-900 dark:text-violet-200 mb-2">All Events</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage and view all your club's events in one place
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div
                    className={`p-4 rounded-lg shadow-sm border-l-4 ${filter === "all" ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20" : "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700"}`}
                    onClick={() => setFilter("all")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${filter === "all" ? "text-violet-800 dark:text-violet-200" : "text-gray-500 dark:text-gray-400"}`}>All Events</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{eventCounts.total}</h3>
                        </div>
                        <div className={`p-2 rounded-full ${filter === "all" ? "bg-violet-100 dark:bg-violet-800/30" : "bg-gray-100 dark:bg-gray-700"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${filter === "all" ? "text-violet-600 dark:text-violet-400" : "text-gray-500 dark:text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    className={`p-4 rounded-lg shadow-sm border-l-4 ${filter === "upcoming" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700"}`}
                    onClick={() => setFilter("upcoming")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${filter === "upcoming" ? "text-indigo-800 dark:text-indigo-200" : "text-gray-500 dark:text-gray-400"}`}>Upcoming</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{eventCounts.upcoming}</h3>
                        </div>
                        <div className={`p-2 rounded-full ${filter === "upcoming" ? "bg-indigo-100 dark:bg-indigo-800/30" : "bg-gray-100 dark:bg-gray-700"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${filter === "upcoming" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    className={`p-4 rounded-lg shadow-sm border-l-4 ${filter === "ongoing" ? "border-green-600 bg-green-50 dark:bg-green-900/20" : "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700"}`}
                    onClick={() => setFilter("ongoing")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${filter === "ongoing" ? "text-green-800 dark:text-green-200" : "text-gray-500 dark:text-gray-400"}`}>Ongoing</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{eventCounts.ongoing}</h3>
                        </div>
                        <div className={`p-2 rounded-full ${filter === "ongoing" ? "bg-green-100 dark:bg-green-800/30" : "bg-gray-100 dark:bg-gray-700"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${filter === "ongoing" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    className={`p-4 rounded-lg shadow-sm border-l-4 ${filter === "past" ? "border-gray-500 bg-gray-50 dark:bg-gray-800/50" : "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700"}`}
                    onClick={() => setFilter("past")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${filter === "past" ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>Past</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{eventCounts.past}</h3>
                        </div>
                        <div className={`p-2 rounded-full ${filter === "past" ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-700"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${filter === "past" ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="w-full md:w-1/3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full md:w-auto">
                    <select
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="dateNewest">Date: Newest First</option>
                        <option value="dateOldest">Date: Oldest First</option>
                        <option value="nameAZ">Name: A-Z</option>
                        <option value="nameZA">Name: Z-A</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                        const status = getEventStatus(event);
                        const statusDetails = getStatusDetails(status);
                        const startDate = new Date(event.date);
                        let endDate;

                        if (event.endDate) {
                            endDate = new Date(event.endDate);
                        } else if (event.duration) {
                            endDate = new Date(startDate.getTime() + parseInt(event.duration) * 60 * 60 * 1000);
                        } else {
                            endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
                        }

                        return (
                            <div
                                key={event._id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                            >
                                {/* Event Header with Status */}
                                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 relative">
                                    <h3 className="text-xl font-bold text-white truncate">{event.eventName}</h3>
                                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${statusDetails.colorClass} flex items-center`}>
                                        <span className={`w-2 h-2 ${statusDetails.dotClass} rounded-full mr-1 animate-pulse`}></span>
                                        {statusDetails.label}
                                    </div>
                                </div>

                                {/* Event Details */}
                                <div className="p-4">
                                    <div className="mb-4">
                                        {/* Date Range */}
                                        <div className="flex items-center mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatDate(event.date)}
                                                </div>
                                                {!isSameDay(startDate, endDate) && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        to {formatDate(endDate)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{event.venue || "No venue specified"}</span>
                                        </div>

                                        {/* Participants */}
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {event.participantsCount || 0} participants
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {event.description || "No description available"}
                                        </p>
                                    </div>

                                    {/* Collaborating Clubs */}
                                    {event.clubIds && event.clubIds.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Collaborating clubs:</p>
                                            <div className="flex space-x-1">
                                                {event.clubIds.slice(0, 4).map((club, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={club.image || `https://ui-avatars.com/api/?name=${club.name}&background=6366f1&color=fff`}
                                                        alt={club.name}
                                                        title={club.name}
                                                        className="w-6 h-6 rounded-full ring-1 ring-white dark:ring-gray-800"
                                                    />
                                                ))}
                                                {event.clubIds.length > 4 && (
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                                        +{event.clubIds.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tags/Categories */}
                                    {event.category && (
                                        <div className="mt-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300">
                                                {event.category}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No events found</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        {searchTerm ? "Try a different search term or filter." : "There are no events to display."}
                    </p>
                </div>
            )}
        </div>
    );
};

// Helper function to check if two dates are on the same day
function isSameDay(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export default AllEventCoordinator;
