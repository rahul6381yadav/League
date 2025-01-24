import React, { useState, useEffect } from "react";
import axios from "axios";

const HomeClub = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState({});
    const token = localStorage.getItem("jwtToken");

    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();
    const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const formattedDate = (date) => date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    useEffect(() => {
        // Fetch all events from the API when the component mounts
        const fetchEvents = async () => {
            try {
                const response = await fetch("http://localhost:4000/api/v1/club/events", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        dateAfter: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                        dateBefore: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
                    },
                });
                const eventsData = {};
                const result = await response.json();
                console.log(result);
                result.events.forEach((event) => {
                    const eventDate = formattedDate(new Date(event.date));
                    if (!eventsData[eventDate]) {
                        eventsData[eventDate] = [];
                    }
                    eventsData[eventDate].push(event);
                });
                setAllEvents(eventsData);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, [currentDate]);

    useEffect(() => {
        if (selectedDate) {
            setEvents(allEvents[formattedDate(selectedDate)] || []);
        }
    }, [selectedDate, allEvents]);

    const changeMonth = (direction) => {
        const newDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + direction,
            1
        );
        setCurrentDate(newDate);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Cancelled":
                return "bg-red-500 text-white";
            case "Upcoming":
                return "bg-green-500 text-white";
            case "Active":
                return "bg-blue-500 text-white";
            case "Past":
                return "bg-gray-500 text-white";
            case "Scheduled":
                return "bg-yellow-500 text-black";
            default:
                return "bg-gray-300 text-black";
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 dark:bg-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-4">
                <button
                    className="p-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                    onClick={() => changeMonth(-1)}
                >
                    Previous
                </button>
                <h2 className="text-lg font-semibold">
                    {currentDate.toLocaleString("default", { month: "long" })}{" "}
                    {currentDate.getFullYear()}
                </h2>
                <button
                    className="p-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                    onClick={() => changeMonth(1)}
                >
                    Next
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center border border-gray-300 dark:border-gray-700 p-2 rounded">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="font-semibold">
                        {day}
                    </div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                    );
                    const isToday = formattedDate(new Date()) === formattedDate(date);
                    const hasEvent = allEvents[formattedDate(date)];

                    return (
                        <button
                            key={day}
                            className={`p-2 rounded ${isToday
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700"
                                } ${hasEvent ? "border-2 border-blue-500" : ""
                                } hover:bg-blue-300 dark:hover:bg-blue-600`}
                            onClick={() => setSelectedDate(date)}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {selectedDate && (
                <div className="mt-4 p-4 bg-gray-200 dark:bg-gray-800 rounded">
                    <h3 className="font-semibold text-lg">
                        Events on {selectedDate.toDateString()}
                    </h3>
                    {events.length > 0 ? (
                        <ul>
                            {events.map((event, index) => (
                                <li key={index} className="mt-2 p-2 border rounded bg-gray-100 dark:bg-gray-700">
                                    <span className="font-bold">{event.eventName}</span> -{" "}
                                    <span>{event.duration}</span>
                                    <div className={`mt-2 px-2 py-1 rounded inline-block ${getStatusColor(event.status)}`}>
                                        {event.status}
                                    </div>
                                    <p className="mt-1">
                                        Venue: {event.venue}
                                    </p>
                                    {event.endDate && (
                                        <p className="mt-1">
                                            End Date: {new Date(event.endDate).toDateString()}
                                        </p>
                                    )}
                                    {event.clubIds && event.clubIds.length > 0 && (
                                        <p className="mt-1">
                                            Clubs: {event.clubIds.map((club) => club.name).join(", ")}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No events scheduled for this date.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default HomeClub;
