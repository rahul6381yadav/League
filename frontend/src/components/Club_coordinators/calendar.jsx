import React, { useState } from "react";
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

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [plans, setPlans] = useState({
    "2025-01-09": ["Meeting at 10 AM", "Doctor's Appointment at 3 PM"],
    "2025-01-15": ["Lunch with Friends", "Work on Project"],
  });
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState("");

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-5">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
        >
          {"<"}
        </button>
        <h3 className="text-xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
        >
          {">"}
        </button>
      </div>
    );
  };

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
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isOutsideMonth = !isSameMonth(day, currentMonth);
        days.push(
          <div
            key={day}
            className={`flex justify-center items-center h-12 w-12 m-1 rounded-lg transition transform hover:scale-110 cursor-pointer
              ${isSameDay(day, selectedDate) ? "bg-blue-500 text-white" : ""}
              ${isOutsideMonth ? "text-gray-400" : "hover:bg-blue-200"}`}
            onClick={() => {
              if (!isOutsideMonth) {
                setSelectedDate(cloneDay);
                setShowModal(true);
              }
            }}
          >
            {format(day, "d")}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex justify-center" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderSidePanel = () => {
    if (!selectedDate) return null;

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const scheduledPlans = plans[formattedDate] || [];

    return (
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-5 shadow-md">
        <h3 className="font-bold mb-3">
          Plans for {format(selectedDate, "MMMM dd, yyyy")}
        </h3>
        <ul className="list-disc pl-5">
          {scheduledPlans.length > 0 ? (
            scheduledPlans.map((plan, index) => <li key={index}>{plan}</li>)
          ) : (
            <li>No plans scheduled.</li>
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

  const handleEventSubmit = () => {
    if (newEvent.trim()) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      setPlans((prevPlans) => {
        const updatedPlans = { ...prevPlans };
        if (!updatedPlans[formattedDate]) {
          updatedPlans[formattedDate] = [];
        }
        if (!updatedPlans[formattedDate].includes(newEvent)) {
          updatedPlans[formattedDate].push(newEvent);
        }
        return updatedPlans;
      });
      setNewEvent("");
      setShowModal(false);
    }
  };

  return (
    <div className={`p-5 max-w-4xl mx-auto ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className="flex justify-between items-center mb-5">
        <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="hidden"
            checked={isDarkMode}
            onChange={() => setIsDarkMode(!isDarkMode)}
          />
          <span className="bg-gray-300 dark:bg-gray-600 w-10 h-5 flex items-center rounded-full p-1">
            <span
              className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${isDarkMode ? "translate-x-5" : ""}`}
            ></span>
          </span>
        </label>
      </div>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {selectedDate && renderSidePanel()}
      {showModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg z-50">
          <h3 className="mb-4 font-bold">
            Add Event for {format(selectedDate, "MMMM dd, yyyy")}
          </h3>
          <input
            type="text"
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Enter event details"
            className="w-full p-2 border border-gray-300 rounded mb-4 dark:border-gray-700 dark:bg-gray-900"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            onClick={handleEventSubmit}
          >
            Add Event
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
