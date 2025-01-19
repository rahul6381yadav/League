import {useEvent} from "../../../../../context/EventContext";

// function formatDateTime(isoString) {
//   const date = new Date(isoString);

//   const options = {
//     year: "numeric",
//     month: "long",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   };

//   return new Intl.DateTimeFormat("en-US", options).format(date);
// }

function getEventStatus(eventDate, duration) {
    if (!eventDate || !duration) return "Status TBD";

    const startTime = new Date(eventDate);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    const now = new Date();

    if (now < startTime) return "Upcoming";
    if (now >= startTime && now <= endTime) return "Ongoing";
    return "Completed";
}

const EventHeader = () => {
    const {event} = useEvent();

    const eventStatus = getEventStatus(event.date, event.duration);

    return (
        <div
            className="w-full bg-blue-500 text-white p-8 shadow-xl flex items-center justify-between dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900">
            {/* Left Section: Event Details */}
            <div className="flex items-center space-x-6">
                {/* Event Image */}
                <div
                    className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-gray-700">
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
                {/* Status */}
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold dark:text-white">📌</span>
                    <span className="text-sm dark:text-gray-400">{eventStatus}</span>
                </div>
            </div>
        </div>
    );
};

export default EventHeader;
