import React, { useState, useEffect } from "react";
import axios from "axios";

const MyCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [ongoingEvents, setOngoingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);

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

    const toIST = (date) => {
        const offset = 330; // IST offset in minutes
        return new Date(new Date(date).getTime() + offset * 60 * 1000);
    };

    const formattedDate = (date) => toIST(date).toISOString().split("T")[0]; // Format: YYYY-MM-DD

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const currentDateTime = new Date();
                const dateAfter = new Date(currentDateTime.setHours(23, 59, 59, 999));
                const dateBefore = new Date(new Date().setHours(0, 0, 0, 0));

                const [upcomingRes, ongoingRes, pastRes] = await Promise.all([
                    axios.get("http://localhost:4000/api/v1/club/events", {
                        params: { dateAfter },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:4000/api/v1/club/events", {
                        params: { ongoing: currentDateTime },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:4000/api/v1/club/events", {
                        params: { dateBefore },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const convertToIST = (events) =>
                    events.map((event) => ({
                        ...event,
                        date: toIST(event.date),
                        endDate: event.endDate ? toIST(event.endDate) : null,
                    }));

                setUpcomingEvents(convertToIST(upcomingRes.data.events || []));
                setOngoingEvents(convertToIST(ongoingRes.data.events || []));
                setPastEvents(convertToIST(pastRes.data.events || []));
            } catch (err) {
                console.error("Failed to fetch events:", err);
            }
        };

        fetchEvents();
    }, [currentDate]);

    useEffect(() => {
        if (selectedDate) {
            const selectedFormattedDate = formattedDate(selectedDate);
            const combinedEvents = [
                ...upcomingEvents,
                ...ongoingEvents,
                ...pastEvents,
            ].filter(
                (event) =>
                    formattedDate(event.date) === selectedFormattedDate
            );

            // Remove duplicate events using a Set with unique event IDs
            const uniqueEvents = Array.from(
                new Map(combinedEvents.map((event) => [event._id, event])).values()
            );

            setEvents(uniqueEvents);
        }
    }, [selectedDate, upcomingEvents, ongoingEvents, pastEvents]);

    const changeMonth = (direction) => {
        const newDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + direction,
            1
        );
        setCurrentDate(newDate);
    };

    const getEventColor = (date) => {
        const formatted = formattedDate(date);
        if (upcomingEvents.some((event) => formattedDate(event.date) === formatted)) {
            return "bg-green-500";
        }
        if (ongoingEvents.some((event) => formattedDate(event.date) === formatted)) {
            return "bg-yellow-500";
        }
        if (pastEvents.some((event) => formattedDate(event.date) === formatted)) {
            return "bg-red-500";
        }
        return "bg-gray-200 dark:bg-gray-700";
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

                    return (
                        <button
                            key={day}
                            className={`p-2 rounded ${getEventColor(date)} ${isToday ? "border-2 border-blue-500" : ""
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
                                    {event.endDate && (
                                        <p>End Date: {new Date(event.endDate).toDateString()}</p>
                                    )}
                                    <p>Venue: {event.venue}</p>
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

export default MyCalendar;
