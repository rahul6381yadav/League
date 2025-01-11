import React, { useState } from "react";
import Calendar from "./calendar";

const HomeClub = () => {
  const [activeTab, setActiveTab] = useState("ActiveEvents");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedEvent(null);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event === selectedEvent ? null : event);
  };

  const handleThemeToggle = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const eventsData = {
    ActiveEvents: [
      { name: "Coding Contest", date: "12th Jan", details: "Participate in a challenging coding competition to test your skills." },
      { name: "Robotics Workshop", date: "15th Jan", details: "Learn about robotics and build your own bot in this interactive workshop." },
      { name: "Hackathon", date: "20th Jan", details: "Collaborate with others to build innovative solutions in 24 hours." },
    ],
    TopEvents: [
      { name: "AI Summit", attendees: "25k", details: "Join the leading experts in AI and explore the future of technology." },
      { name: "Tech Expo", attendees: "18k", details: "Discover the latest innovations and network with tech leaders." },
      { name: "Developer Conference", attendees: "15k", details: "A conference for developers to share and learn about cutting-edge tools and techniques." },
    ],
  };

  const renderEvents = (events) =>
    events.map((event, index) => (
      <li
        key={index}
        onClick={() => handleEventClick(event)}
        className={`p-3 rounded-md transition cursor-pointer ${
          selectedEvent === event
            ? "bg-gray-300"
            : isDarkMode
            ? "bg-gray-700 text-white hover:bg-gray-600 hover:text-white"
            : "bg-gray-200 text-gray-900 hover:bg-gray-300 hover:text-black"
        }`}
      >
        <span className="font-medium">{event.name}</span> - {event.date || `${event.attendees} attendees`}
        {selectedEvent === event && (
          <div className="mt-2 p-3 bg-gray-800 text-white rounded-md">
            <p>{event.details}</p>
          </div>
        )}
      </li>
    ));

  return (
    <div
      className={`w-screen h-screen flex flex-col items-start justify-start p-4 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Navigation Box */}
      <div
        className={`p-4 w-full md:w-2/3 lg:w-1/2 rounded-lg shadow-lg ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleTabClick("ActiveEvents")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "ActiveEvents"
                  ? "bg-blue-600"
                  : isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Active Events
            </button>
            <button
              onClick={() => handleTabClick("TopEvents")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "TopEvents"
                  ? "bg-blue-600"
                  : isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Top Events
            </button>
          </div>
          {/* Theme Toggle */}
          <div>
            <label className="flex items-center cursor-pointer">
              <span className="mr-2">{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
              <input
                type="checkbox"
                className="hidden"
                onChange={handleThemeToggle}
                checked={isDarkMode}
              />
              <div
                className={`w-10 h-5 flex items-center rounded-full p-1 ${
                  isDarkMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform ${
                    isDarkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </label>
          </div>
        </div>

        {/* Content Section */}
        <div
          className={`p-4 rounded-lg overflow-y-auto max-h-[50vh] ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          {activeTab === "ActiveEvents" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-left">Active Events</h2>
              <ul className="space-y-2">{renderEvents(eventsData.ActiveEvents)}</ul>
            </div>
          )}

          {activeTab === "TopEvents" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-left">Top Events</h2>
              <ul className="space-y-2">{renderEvents(eventsData.TopEvents)}</ul>
            </div>
          )}
        </div>
        <Calendar />
      </div>
    </div>
  );
};

export default HomeClub;
