import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios"; // Import axios for making API requests
import {jwtDecode} from "jwt-decode";
import PastParticipants from "./PastParticipants";

const HomePage = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]); // State to hold upcoming events
    const [todaySchedule, setTodaySchedule] = useState([]); // State to hold today's schedule
    const [loading, setLoading] = useState(true); // State to handle loading state
    const [error, setError] = useState(null); // State to handle errors
    const [totalPoints, setTotalPoints] = useState(null); // State to store total points
    const { userId, isAuthenticated } = useAuth();


// Token decoding logic remains the same
    const token = localStorage.getItem("jwtToken");
    let decodedToken = null;
    if (token) {
        try {
            decodedToken = jwtDecode(token);
        } catch (error) {
            console.error("Error decoding JWT token:", error.message);
        }
    }


    const pastParticipation = [
        { event: "Hackathon", date: "2024-11-15", points: 30 },
        { event: "Cultural Fest", date: "2024-12-05", points: 40 },
        { event: "Tech Conference", date: "2025-01-10", points: 50 },
    ];

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
    const studentId = decodedToken.userId;
    useEffect(() => {
        // Fetch upcoming events from the backend API
        const fetchUpcomingEvents = async () => {
            try {
                const currentDate = new Date();
                const dateAfter = new Date(currentDate.setHours(23, 59, 59, 999));
                const params = {
                    dateAfter
                };
                const response = await axios.get("http://localhost:4000/api/v1/club/events", {
                    params:params,
                    headers: { Authorization: `Bearer ${token}` },
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
                const currentDate = new Date();
                const dateAfter = new Date(currentDate.setHours(0, 0, 0, 0)); // Start of today
                const dateBefore = new Date(currentDate.setHours(23, 59, 59, 999)); // End of today
                const params = {
                    dateAfter,
                    dateBefore
                };
       
                const response = await axios.get("http://localhost:4000/api/v1/club/events", {
                    params: params,
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTodaySchedule(response.data.events); // Assuming response.data.schedule contains the today's schedule

                setLoading(false);
            } catch (err) {
                setError("Failed to load today's schedule");
                setLoading(false);
            }
        };

        const fetchTotalPoints = async () => {
            try {
                let sumPoints = 0;
                const response = await fetch(`http://localhost:4000/api/v1/club/attendance?studentId=${studentId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                // Check if result.records is an array
                if (Array.isArray(result.records)) {
                    // Iterate over the records and sum up pointsgiven
                    result.records.forEach(record => {
                        sumPoints += record.pointsGiven || 0;// Default to 0 if pointsgiven is undefined
                    });

                    setTotalPoints(sumPoints);
                    updateTotalPoints(sumPoints);
                } else {
                    console.log("No records found or result.records is not an array");
                }
            } catch (error) {
                console.log("Error: ", error);
            }
        };

        const updateTotalPoints = async (sumPoints) => {
            try {
                // Extract the studentId from the decoded JWT token

                // Make a GET request to the backend to fetch the user's profile, passing studentId
                const response = await fetch(`http://localhost:4000/user/profile?id=${studentId}`, {
                    method: "PUT",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        TotalPoints: sumPoints,
                    }),
                });
                const result = await  response.json();
                // Check if the request was successful
                if (response.status === 200) {
                    setLoading(false);  // Add this line
                }
            } catch (error) {
                console.error('Error fetching total points:', error);
                setLoading(false);  // Also add this line in the catch block
            }
        };


        fetchUpcomingEvents();
        fetchTodaySchedule();
        fetchTotalPoints();
    }, [token]);

    return (
        <div className="min-h-screen p-8 bg-mirage-50 dark:bg-mirage-950">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column (Previously Right Column) */}
                <div className="space-y-6">
                    {/* Today's Schedule */}
                    <div className="p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                        <h2 className="text-lg font-semibold mb-4 text-center text-mirage-900 dark:text-mirage-50">Today's
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
                                            className={`flex-shrink-0 p-4 rounded-lg shadow ${task.color} bg-mirage-100 dark:bg-mirage-900 text-mirage-800 dark:text-mirage-200`}
                                            style={{ minWidth: "200px" }}
                                        >
                                            <p className="text-sm font-medium mb-2 text-mirage-700 dark:text-mirage-200">
                                                {localStartTime} - {localEndTime}
                                            </p>
                                            <p className="text-m font-medium mb-3 text-mirage-900 dark:text-mirage-50">
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
                                                            style={{ whiteSpace: "nowrap" }}>
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
                    <div className="p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                        <h2 className="text-lg font-semibold mb-4 text-center text-mirage-900 dark:text-mirage-50">Upcoming Events</h2>
                        {loading ? (
                            <p>Loading events...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <div className="flex flex-wrap justify-start gap-4">
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

                                    // Format the event date (e.g., January 20, 2025)
                                    const formattedDate = eventStartDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    });

                                    return (
                                        <div
                                            key={index}
                                            className="flex-shrink-0 p-4 rounded-lg shadow bg-mirage-100 dark:bg-mirage-900 text-mirage-800 dark:text-mirage-200 flex flex-col space-y-2"
                                            style={{ minWidth: "200px" }}
                                        >
                                            <p className="text-m font-semibold text-mirage-900 dark:text-mirage-50">
                                                {event.eventName}
                                            </p>
                                            {/* Display the event date */}
                                            <p className="text-sm font-medium text-mirage-700 dark:text-mirage-200">
                                                {formattedDate}
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
                                            <p className="text-sm font-medium text-mirage-700 dark:text-mirage-200">
                                                {localStartTime} - {localEndTime}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>



                    {/* Participation Calendar */}
                    <div className="mt-6 p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                        <h3 className="text-lg font-semibold mb-4 text-mirage-900 dark:text-mirage-50">Participation
                            Calendar</h3>
                        <div className="flex justify-center">
                            <CalendarHeatmap
                                startDate={new Date(`${currentYear}-01-01`)}
                                endDate={new Date(`${currentYear}-12-31`)}
                                values={heatmapData}
                                classForValue={(value) => {
                                    return value ? getColorForPoints(value.count) : "bg-mirage-200 dark:bg-mirage-700";
                                }}
                                gutterSize={4}
                                showMonthLabels={true}
                                monthLabels={[
                                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                ]}
                                weekdayLabels={["M", "T", "W", "T", "F", "S"]}
                                cellSize={20}
                                style={{ pointerEvents: "none" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Student of the Year and Student of the Month in the same row */}
                    <div className="flex gap-6">
                        {/* Student of the Year */}
                        <div className="p-4 w-1/2 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                            <h2 className="text-lg font-bold mb-2 text-center text-mirage-900 dark:text-mirage-50">Student
                                of the Year</h2>
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden border-4">
                                    <img
                                        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                                        alt="Student Photo"
                                        className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center text-sm text-mirage-900 dark:text-mirage-50">
                                    <p>Name: <span className="font-semibold">Shaurya Yadav</span></p>
                                    <p>Roll No: <span className="font-semibold">CS22B1050</span></p>
                                    <p>Point: <span className="font-semibold">6969</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Student of the Month */}
                        <div className="p-4 w-1/2 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                            <h2 className="text-lg font-bold mb-2 text-center text-mirage-900 dark:text-mirage-50">Student
                                of the Month</h2>
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden border-4">
                                    <img
                                        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                                        alt="Student Photo"
                                        className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center text-sm text-mirage-900 dark:text-mirage-50">
                                    <p>Name: <span className="font-semibold">Prathu Chotu</span></p>
                                    <p>Roll No: <span className="font-semibold">CS22B1041</span></p>
                                    <p>Point: <span className="font-semibold">0.1</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modified Total Points section */}
                    <div className="p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                        <h2 className="text-lg font-semibold mb-4 text-center text-mirage-900 dark:text-mirage-50">Total Points</h2>
                        <div className="flex items-center justify-center h-full">
                            <p className="text-4xl font-bold text-mirage-900 dark:text-mirage-50">
                                {loading ? "Loading..." : totalPoints}
                            </p>
                        </div>
                    </div>

                    {/* Past Participation */}
                    {/* <div className="mt-6 p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                        <h2 className="text-lg font-semibold mb-4 text-mirage-900 dark:text-mirage-50">Past
                            Participation</h2>
                        <table className="table-auto w-full text-left border-collapse">
                            <thead>
                            <tr>
                                <th className="px-4 py-2 text-mirage-700 dark:text-mirage-200">Event</th>
                                <th className="px-4 py-2 text-mirage-700 dark:text-mirage-200">Date</th>
                                <th className="px-4 py-2 text-mirage-700 dark:text-mirage-200">Points Credited</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pastParticipation.map((participation, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 text-mirage-900 dark:text-mirage-50">{participation.event}</td>
                                    <td className="px-4 py-2 text-mirage-900 dark:text-mirage-50">{participation.date}</td>
                                    <td className="px-4 py-2 text-mirage-900 dark:text-mirage-50">{participation.points}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div> */}
                    <PastParticipants studentId={studentId} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
