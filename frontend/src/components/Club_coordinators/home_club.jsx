import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";

const HomeClub = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found. Please log in.");
        return;
      }

      const response = await axios.get("http://localhost:4000/api/v1/club/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.events) {
        const formattedEvents = response.data.events.map((event) => ({
          ...event,
          date: new Date(event.date).toISOString().split('T')[0],
        }));
        setEvents(formattedEvents);
      }
    } catch (err) {
      console.error("Error fetching events:", err.response || err.message);
    }
  };

  const getEventsForDate = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log("Checking events for date:", formattedDate);
    return events.filter((event) => event.date === formattedDate);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-5">
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
        onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
      >
        {"<"}
      </button>
      <h3 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h3>
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
        onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
      >
        {">"}
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 text-center font-bold mb-2">
        {days.map((day, index) => (
          <div key={index}>{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
  
    const rows = [];
    let days = [];
    let currentDay = new Date(startDate);
  
    while (currentDay <= endDate) {
      for (let i = 0; i < 7; i++) {
        const isOutsideMonth = !isSameMonth(currentDay, currentMonth);
        const eventsForDay = getEventsForDate(currentDay);
  
        days.push(
          <div
            key={currentDay}
            className={`flex justify-center items-center h-12 w-12 m-1 rounded-lg transition transform hover:scale-110 cursor-pointer ${
              isSameDay(currentDay, selectedDate) ? "bg-blue-500 text-white" : ""
            } ${isOutsideMonth ? "text-gray-400" : "hover:bg-blue-200"}`}
            onClick={() => {
              if (!isOutsideMonth) {
                const selectedDay = new Date(currentDay);
                setSelectedDate(selectedDay); // Ensure we are setting the selected day correctly
                console.log("Selected date:", format(selectedDay, "yyyy-MM-dd")); // Log the selected date
              }
            }}
          >
            <div className="text-center">
              {format(currentDay, "d")}
              {eventsForDay.length > 0 && (
                <span className="block mt-1 w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </div>
          </div>
        );
        currentDay = addDays(currentDay, 1);
      }
  
      rows.push(
        <div className="flex justify-center" key={currentDay}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };
  

  const renderSidePanel = () => {
    if (!selectedDate) return null;
  
    const eventsForDay = getEventsForDate(selectedDate);
  
    return (
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-5 shadow-md">
        <h3 className="font-bold mb-3">
          Events for {format(selectedDate, "MMMM dd, yyyy")} {/* Correct date formatting */}
        </h3>
        <ul className="list-disc pl-5">
          {eventsForDay.length > 0 ? (
            eventsForDay.map((event, index) => <li key={index}>{event.name}</li>)
          ) : (
            <li>No events scheduled.</li>
          )}
        </ul>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          onClick={() => setSelectedDate(null)}
        >
          Close
        </button>
      </div>
    );
  };
  

  return (
    <div className="p-5 max-w-4xl mx-auto">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {selectedDate && renderSidePanel()}
    </div>
  );
};

export default HomeClub;