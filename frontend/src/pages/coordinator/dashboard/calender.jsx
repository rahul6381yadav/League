import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../../../utils/routes";
import { useNavigate } from 'react-router-dom';
const MyCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [ongoingEvents, setOngoingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

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

    const formattedDate = (date) => {
        const offsetDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000); // Adjust to IST
        return offsetDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const currentDateTime = new Date();
                const dateAfter = new Date(currentDateTime.setHours(23, 59, 59, 999));
                const dateBefore = new Date(new Date().setHours(0, 0, 0, 0));

                const [upcomingRes, ongoingRes, pastRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/v1/club/events`, {
                        params: { dateAfter: formattedDate(dateAfter) },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${backendUrl}/api/v1/club/events`, {
                        params: { ongoing: formattedDate(currentDateTime) },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${backendUrl}/api/v1/club/events`, {
                        params: { dateBefore: formattedDate(dateBefore) },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                console.log("upcoming events: ",upcomingRes.data.events);
                console.log("ongoing events: ", ongoingRes.data.events);
                console.log("past events: ", pastRes.data.events);
                setUpcomingEvents(upcomingRes.data.events || []);
                setOngoingEvents(ongoingRes.data.events || []);
                setPastEvents(pastRes.data.events || []);
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
                    formattedDate(new Date(event.date)) === selectedFormattedDate
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
        if (upcomingEvents.some((event) => formattedDate(new Date(event.date)) === formatted)) {
            return "bg-green-500";
        }
        if (ongoingEvents.some((event) => formattedDate(new Date(event.date)) === formatted)) {
            return "bg-yellow-500";
        }
        if (pastEvents.some((event) => formattedDate(new Date(event.date)) === formatted)) {
            return "bg-red-500";
        }
        return "bg-mirage-100 dark:bg-mirage-700";
    };

    return (
        <div className="max-w-4xl mx-auto p-4 dark:bg-mirage-900 dark:text-white">

            {/* Calendar Section */}
            <div className="p-4 w-full rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                <h2 className="text-lg font-bold mb-2 text-mirage-900 dark:text-mirage-50 text-center">
                    Event Calendar
                </h2>
                <div className="flex justify-between items-center mb-4">
                    <button
                        className="p-2 rounded bg-mirage-300 text-mirage-950 dark:text-mirage-50 dark:bg-mirage-700 hover:bg-mirage-400 dark:hover:bg-mirage-600"
                        onClick={() => changeMonth(-1)}
                    >
                        Previous
                    </button>
                    <h2 className="text-lg text-mirage-950 dark:text-mirage-50 font-semibold">
                        {currentDate.toLocaleString("default", { month: "long" })}{" "}
                        {currentDate.getFullYear()}
                    </h2>
                    <button
                        className="p-2 rounded bg-mirage-300 text-mirage-950 dark:text-mirage-50 dark:bg-mirage-700 hover:bg-mirage-400 dark:hover:bg-mirage-600"
                        onClick={() => changeMonth(1)}
                    >
                        Next
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-mirage-950 dark:text-mirage-50 text-center border border-mirage-300 dark:border-mirage-700 p-2 rounded">
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
                                className={`p-2 rounded ${getEventColor(date)} ${isToday ? "border-2 text-mirage-950 dark:text-mirage-50 border-blue-500" : ""
                                    } hover:bg-blue-300 text-mirage-950 dark:text-mirage-50 dark:hover:bg-blue-600`}
                                onClick={() => setSelectedDate(date)}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>

                {selectedDate && (
                    <div className="p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800 mt-6">
                        <h2 className="text-lg font-semibold mb-4 text-center text-mirage-900 dark:text-mirage-50">
                            Events on {selectedDate.toDateString()}
                        </h2>
                        <div className="flex overflow-x-auto space-x-4">
                            {events.length > 0 ? (
                                events.map((event, index) => {
                                    const eventStartDate = new Date(event.date);
                                    const localStartTime = eventStartDate.toLocaleString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        timeZone: "Asia/Kolkata",
                                    });

                                    const eventEndDate = new Date(event.endDate);
                                    const localEndTime = eventEndDate.toLocaleString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        timeZone: "Asia/Kolkata",
                                    });

                                    return (
                                        <div
                                            key={index}
                                            className="flex-shrink-0 p-4 rounded-lg shadow bg-mirage-100 dark:bg-mirage-700 text-mirage-800 dark:text-mirage-200"
                                            style={{ minWidth: "200px" }}
                                            onClick={() => {
                                                navigate(`/event-signup/${event._id}`)
                                            }}
                                        >
                                            <p className="text-sm font-medium text-mirage-700 dark:text-mirage-200 mb-2">
                                                Date: {eventStartDate.getDate()}/
                                                {eventStartDate.getMonth() + 1}/
                                                {eventStartDate.getFullYear()} -{" "}
                                                {eventEndDate.getDate()}/
                                                {eventEndDate.getMonth() + 1}/
                                                {eventEndDate.getFullYear()}
                                            </p>
                                            <p className="text-sm font-medium mb-2 text-mirage-700 dark:text-mirage-200">
                                                {event.duration}
                                            </p>
                                            <p className="text-m font-medium mb-3 text-mirage-900 dark:text-mirage-50">
                                                {event.eventName}
                                            </p>
                                            <p className="text-sm text-mirage-700 dark:text-mirage-200">
                                                Venue: {event.venue}
                                            </p>
                                            <div className="flex space-x-2">
                                                {event.clubIds.map((club, clubIndex) => (
                                                    <div key={clubIndex} className="relative group">
                                                        <img
                                                            src={club.image} // Assuming each club has an imageUrl property
                                                            alt={club.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                        <span
                                                            className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                            style={{ whiteSpace: "nowrap" }}
                                                        >
                                                            {club.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-mirage-900 dark:text-mirage-50">
                                    No events scheduled for this date.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCalendar;
