import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const PastParticipants = (props) => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 2;
    const studentId = props.studentId;
    useEffect(() => {
        const fetchAttendanceData = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                console.error("JWT token not found");
                setError("User not authenticated");
                return;
            }

            let decodedToken = null;
            try {
                decodedToken = jwtDecode(token);
            } catch (decodeError) {
                console.error("Error decoding JWT token:", decodeError.message);
                setError("Invalid token");
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:4000/api/v1/club/attendance?studentId=${studentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (Array.isArray(result.records)) {
                    // Sort the attendance data by event start date (descending)
                    const sortedData = result.records.sort((a, b) => {
                        const dateA = new Date(a.eventId.date);
                        const dateB = new Date(b.eventId.date);
                        return dateB - dateA; // Compare dates for descending order
                    });
                    setAttendanceData(sortedData);
                } else {
                    console.error("Unexpected API response:", result);
                    setAttendanceData([]);
                }
            } catch (fetchError) {
                console.error("Error fetching attendance data:", fetchError.message);
                setError("Failed to fetch attendance data");
            }
        };

        fetchAttendanceData();
    }, []);

    const handleNext = () => {
        if (currentPage * eventsPerPage < attendanceData.length) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const displayedEvents = attendanceData.slice(
        (currentPage - 1) * eventsPerPage,
        currentPage * eventsPerPage
    );

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="mt-6 p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
            <h2 className="text-lg font-semibold mb-4 text-mirage-900 dark:text-mirage-50">
                Past Participation
            </h2>
            {attendanceData.length === 0 ? (
                <p className="text-mirage-900 dark:text-mirage-50">
                    No participation records found.
                </p>
            ) : (
                <>
                    <table className="table-auto w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-mirage-700 dark:text-mirage-200">
                                    Event
                                </th>
                                <th className="px-4 py-2 text-mirage-700 dark:text-mirage-200">
                                    Date
                                </th>
                                <th className="px-4 py-2 text-mirage-700 dark:text-mirage-200">
                                    Points Credited
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedEvents.map((participation, index) => {
                                const eventStartDate = new Date(participation.eventId.date);
                                const formattedDate = eventStartDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                });

                                return (
                                    <tr key={index}>
                                        <td className="px-4 py-2 text-mirage-900 dark:text-mirage-50">
                                            {participation.eventId.eventName}
                                        </td>
                                        <td className="px-4 py-2 text-mirage-900 dark:text-mirage-50">
                                            {formattedDate}
                                        </td>
                                        <td className="px-4 py-2 text-mirage-900 dark:text-mirage-50">
                                            {participation.pointsGiven}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="mt-4 flex justify-between">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg ${currentPage === 1
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage * eventsPerPage >= attendanceData.length}
                            className={`px-4 py-2 rounded-lg ${currentPage * eventsPerPage >= attendanceData.length
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PastParticipants;
