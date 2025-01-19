import React, {useEffect, useState} from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import {useAuth} from "../../context/AuthContext";
import axios from "axios"; // Import axios for making API requests

const Dashboard = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]); // State to hold upcoming events
    const [todaySchedule, setTodaySchedule] = useState([]); // State to hold today's schedule
    const [loading, setLoading] = useState(true); // State to handle loading state
    const [error, setError] = useState(null); // State to handle errors
    const {userId, isAuthenticated} = useAuth();
    const token = localStorage.getItem("authToken");

    const pastParticipation = [
        {event: "Hackathon", date: "2024-11-15", points: 30},
        {event: "Cultural Fest", date: "2024-12-05", points: 40},
        {event: "Tech Conference", date: "2025-01-10", points: 50},
    ];

    const totalPoints = 120;

    const heatmapData = pastParticipation.map((participation) => ({
        date: participation.date,
        count: participation.points,
    }));

    const getColorForPoints = (points) => {
        if (points >= 50) return "bg-green-500";
        if (points <= 50) return "bg-green-300";
        return "bg-green-700";
    };

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        // Fetch upcoming events from the backend API
        const fetchUpcomingEvents = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/v1/club/events", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setUpcomingEvents(response.data.events); // Assuming response.data.events contains the list of events
                setLoading(false);
            } catch (err) {
                setError("Failed to load events");
                setLoading(false);
            }
        };

        // Fetch today's schedule from the backend API
        const fetchTodaySchedule = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/v1/club/events", {
                    params: {date: new Date().toISOString()},
                    headers: {Authorization: `Bearer ${token}`},
                });
                setTodaySchedule(response.data.events); // Assuming response.data.schedule contains the today's schedule

                setLoading(false);
            } catch (err) {
                setError("Failed to load today's schedule");
                setLoading(false);
            }
        };

        fetchUpcomingEvents();
        fetchTodaySchedule();
    }, [token]);

    return (
        <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column (Previously Right Column) */}
                <div className="space-y-6">
                    {/* Today's Schedule */}
                    <div className="p-6 rounded-lg shadow-md dark:bg-purple-700 bg-purple-300">
                        <h2 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">Today's
                            Schedule</h2>
                        <div className="flex overflow-x-auto space-x-4">
                            {loading ? (
                                <p>Loading today's schedule...</p>
                            ) : error ? (
                                <p className="text-red-500">{error}</p>
                            ) : (
                                todaySchedule.map((task, index) => {
                                    const taskDate = new Date(task.date); // Ensure task.date is a Date object
                                    const localStartTime = taskDate.toLocaleString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'Asia/Kolkata', // Timezone set to UTC+5:30
                                    });

                                    const taskEndDate = new Date(task.endDate);
                                    const localEndTime = taskEndDate.toLocaleString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'Asia/Kolkata', // Timezone set to UTC+5:30
                                    });

                                    return (
                                        <div
                                            key={index}
                                            className={`flex-shrink-0 p-4 rounded-lg shadow ${task.color} bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200`}
                                            style={{minWidth: "200px"}}
                                        >
                                            <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                                {localStartTime} - {localEndTime}
                                            </p>
                                            <p className="text-m font-medium mb-3 text-gray-900 dark:text-gray-100">
                                                {task.eventName}
                                            </p>
                                            <div className="flex space-x-2">
                                                {task.clubIds.map((club, clubIndex) => (
                                                    <div key={clubIndex} className="relative group">
                                                        <img
                                                            src={club.image} // Assuming each club has an imageUrl property
                                                            alt={club.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                        <span
                                                            className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                            style={{whiteSpace: "nowrap"}}>
                                                          {club.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="p-6 rounded-lg shadow-md dark:bg-purple-700 bg-purple-300">
                        <h2 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">Upcoming
                            Events</h2>
                        {loading ? (
                            <p>Loading events...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <div className="space-y-4">
                                {upcomingEvents.map((event, index) => {
                                    const eventStartDate = new Date(event.date);
                                    const localStartTime = eventStartDate.toLocaleString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'Asia/Kolkata', // Timezone set to UTC+5:30
                                    });

                                    const eventEndDate = new Date(event.endDate);
                                    const localEndTime = eventEndDate.toLocaleString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'Asia/Kolkata', // Timezone set to UTC+5:30
                                    });

                                    return (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg shadow bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 flex flex-col space-y-2"
                                        >
                                            <p className="text-m font-semibold text-gray-900 dark:text-gray-100">
                                                {event.eventName}
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
                                                            style={{whiteSpace: "nowrap"}}>
                    {club.name}
                  </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                {localStartTime} - {localEndTime}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>


                    {/* Participation Calendar */}
                    <div className="mt-6 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Participation
                            Calendar</h3>
                        <div className="flex justify-center">
                            <CalendarHeatmap
                                startDate={new Date(`${currentYear}-01-01`)}
                                endDate={new Date(`${currentYear}-12-31`)}
                                values={heatmapData}
                                classForValue={(value) => {
                                    return value ? getColorForPoints(value.count) : "bg-gray-200 dark:bg-gray-700";
                                }}
                                gutterSize={4}
                                showMonthLabels={true}
                                monthLabels={[
                                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                ]}
                                weekdayLabels={["M", "T", "W", "T", "F", "S"]}
                                cellSize={20}
                                style={{pointerEvents: "none"}}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column (Previously Left Column) */}
                <div className="space-y-6">
                    {/* Student of the Year and Student of the Month in the same row */}
                    <div className="flex gap-6">
                        {/* Student of the Year */}
                        <div className="p-4 w-1/2 rounded-lg shadow-md bg-white dark:bg-gray-800">
                            <h2 className="text-lg font-bold mb-2 text-center text-gray-900 dark:text-gray-100">Student
                                of the Year</h2>
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden border-4">
                                    <img
                                        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                                        alt="Student Photo"
                                        className="w-full h-full object-cover"/>
                                </div>
                                <div className="text-center text-sm text-gray-900 dark:text-gray-100">
                                    <p>Name: <span className="font-semibold">John Doe</span></p>
                                    <p>Roll No: <span className="font-semibold">123456</span></p>
                                    <p>Point: <span className="font-semibold">456</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Student of the Month */}
                        <div className="p-4 w-1/2 rounded-lg shadow-md bg-white dark:bg-gray-800">
                            <h2 className="text-lg font-bold mb-2 text-center text-gray-900 dark:text-gray-100">Student
                                of the Month</h2>
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden border-4">
                                    <img
                                        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                                        alt="Student Photo"
                                        className="w-full h-full object-cover"/>
                                </div>
                                <div className="text-center text-sm text-gray-900 dark:text-gray-100">
                                    <p>Name: <span className="font-semibold">Jane Smith</span></p>
                                    <p>Roll No: <span className="font-semibold">654321</span></p>
                                    <p>Point: <span className="font-semibold">123</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Points */}
                    <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
                        <h2 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">Total
                            Points</h2>
                        <div className="flex items-center justify-center h-full">
                            <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{totalPoints}</p>
                        </div>
                    </div>

                    {/* Past Participation */}
                    <div className="mt-6 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Past
                            Participation</h2>
                        <table className="table-auto w-full text-left border-collapse">
                            <thead>
                            <tr>
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Event</th>
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Date</th>
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Points Credited</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pastParticipation.map((participation, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{participation.event}</td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{participation.date}</td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{participation.points}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;