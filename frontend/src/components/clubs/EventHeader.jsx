import { useEffect, useState } from "react";
import axios from "axios";

const formatDateTime = (isoString) => {
  const date = new Date(isoString);

  // Use Intl.DateTimeFormat for both date and time
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true }; // 12-hour format

  const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(
    date
  );
  const formattedTime = new Intl.DateTimeFormat("en-US", timeOptions).format(
    date
  );

  return `${formattedDate} ${formattedTime}`;
};

const EventHeader = ({ id }) => {
  const [event, setEvent] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/v1/club/events?id=${id}`
        );
        setEvent(response.data.event);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="w-full bg-blue-500  text-white p-8 shadow-xl flex items-center justify-between dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900">
      {/* Left Section: Event Details */}
      <div className="flex items-center space-x-6">
        {/* Event Image */}
        <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-gray-700">
          <img
            src={"https://via.placeholder.com/150"}
            alt={event.eventName}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Event Name and Description */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold leading-tight dark:text-white">
            {event.eventName}
          </h1>
          <p className="text-sm text-gray-200 mt-1 dark:text-gray-400">
            {event.description || "Description not available"}
          </p>
        </div>
      </div>

      {/* Right Section: Event Info */}
      <div className="flex flex-col items-end space-y-2">
        {/* Venue */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold dark:text-white">📍</span>
          <span className="text-sm dark:text-gray-400">
            {event.venue || "Venue TBD"}
          </span>
        </div>
        {/* Date */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold dark:text-white">📅</span>
          <span className="text-sm dark:text-gray-400">
            {event.date || "Date TBD"}
          </span>
        </div>
        {/* Duration */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold dark:text-white">⏰</span>
          <span className="text-sm dark:text-gray-400">
            {event.duration || "Duration TBD"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventHeader;
