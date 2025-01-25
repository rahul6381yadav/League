import React, { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Trophy } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("jwtToken");
const decodedToken = token ? jwtDecode(token) : null;

const Leaderboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:4000/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        role: "student",
                    },
                });
                // Sort students first by total points (descending), then by studentId (ascending)
                const sortedStudents = response.data.users.sort((a, b) => {
                    // First, compare total points in descending order
                    if (b.TotalPoints !== a.TotalPoints) {
                        return b.TotalPoints - a.TotalPoints;
                    }

                    // If points are equal, compare studentId in ascending order
                    return a.studentId.localeCompare(b.studentId);
                });

                setStudents(sortedStudents);
            } catch (err) {
                setError(err.message || "Failed to fetch students.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // Function to determine background and styling for top 3 students
    const getRowStyle = (index) => {
        switch (index) {
            case 0:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 dark:text-white';
            case 1:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-800 dark:text-white';
            case 2:
                return 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-800 dark:text-white';
            default:
                return 'bg-mirage-300 dark:bg-mirage-700 text-mirage-700 dark:text-mirage-200';
        }
    };

    if (loading) return (
        <div className="h-screen w-full flex bg-mirage-50 dark:bg-mirage-900 items-center justify-center">
            <div className="animate-pulse">
                <div className="h-8 bg-mirage-200 dark:bg-mirage-600 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-mirage-200 dark:bg-mirage-600 rounded w-full mb-4"></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="h-screen w-full flex bg-mirage-50 dark:bg-mirage-900 items-center justify-center">
            <div className="text-red-500">Error: {error}</div>
        </div>
    );

    return (
        <div className="h-screen w-full flex bg-mirage-50 dark:bg-mirage-900">
            <div className="h-full w-full grid grid-cols-1 gap-8 p-8">
                <div className="bg-mirage-200 dark:bg-mirage-800 rounded-lg shadow-md h-full">
                    {/* Fixed Header */}
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-mirage-700 dark:text-mirage-300">Overall Leaderboard</h1>
                            <span className="bg-mirage-100 dark:bg-mirage-600 text-mirage-800 dark:text-mirage-300 text-sm font-medium px-3 py-1 rounded-full">
                                {students.length} Students
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Participants List */}
                    <div className="flex-1 min-h-0 h-[calc(100vh-8rem)] overflow-y-auto">
                        <div className="p-6">
                            {students.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {students.map((student, index) => {
                                        const isCurrentUser = student._id === decodedToken?.userId;
                                        return (
                                            <div
                                                key={student._id}
                                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                                    isCurrentUser
                                                        ? 'bg-blue-200 dark:bg-blue-900 border-2 border-blue-500'
                                                        : getRowStyle(index)
                                                }`}
                                                onClick={() => {
                                                    if (isCurrentUser) {
                                                        navigate(`/myProfile`);
                                                    } else {
                                                        navigate(`/friends/${student._id}`);
                                                    }
                                                }}
                                            >
                                                {/* Profile Picture and Details */}
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <img
                                                        src={student.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                        alt={student.fullName}
                                                        className="w-12 h-12 rounded-full border border-mirage-300 dark:border-mirage-500"
                                                    />

                                                    {/* Name and Additional Details */}
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium flex items-center text-mirage-700 dark:text-mirage-200">
                                                            {student.fullName}{isCurrentUser && (<span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">You</span>)}
                                                        </h4>
                                                        <div className="flex items-center space-x-2 text-xs text-mirage-500 dark:text-mirage-300">
                                                            <Mail className="w-4 h-4" />
                                                            <span>{student.email}</span>
                                                        </div>
                                                        <div className="text-xs text-mirage-500 dark:text-mirage-300">
                                                            Batch: {student.batchCode} | Student ID: {student.studentId}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Points with Capsule Background */}
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-mirage-100 dark:bg-mirage-600">
                                                        <Trophy className={`w-4 h-4 text-gray-800 dark:text-mirage-100`} />
                                                        <span className={'ml-1 text-gray-800 dark:text-mirage-100'}>{student.TotalPoints}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-mirage-500 dark:text-mirage-400 text-center">No students found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;