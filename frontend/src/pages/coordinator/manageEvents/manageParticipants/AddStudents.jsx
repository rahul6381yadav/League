import React, { useState, useEffect } from 'react';
import { backendUrl } from "../../../../utils/routes";
import axios from "axios";
import {
    Search,
    Users,
    Loader2,
    Check,
    CheckCircle2,
    X,
    AlertCircle
} from 'lucide-react';

function AddStudents({ onStudentsSelected }) {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, type: "", message: "" });

    const token = localStorage.getItem("jwtToken");

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${backendUrl}/user/profile?role=student&search=${search}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.data.isError) {
                setStudents(response.data.users);
            }
        } catch (error) {
            showNotification("error", "Failed to fetch students");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [search]);

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false }), 3000);
    };

    const handleCheckboxChange = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleConfirm = () => {
        if (selectedStudents.length === 0) {
            showNotification("error", "Please select at least one student");
            return;
        }
        onStudentsSelected(selectedStudents);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = students.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(students.length / itemsPerPage);

    return (
        <div className="relative">
            {/* Notification */}
            {notification.show && (
                <div className={`absolute top-0 right-0 left-0 mx-auto w-full max-w-md p-4 rounded-md shadow-lg z-50 animate-slide-down flex items-center justify-between
                    ${notification.type === "success" ? "bg-green-100 text-green-800 border-l-4 border-green-500" :
                        "bg-red-100 text-red-800 border-l-4 border-red-500"}`}>
                    <div className="flex items-center gap-2">
                        {notification.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>{notification.message}</span>
                    </div>
                    <button onClick={() => setNotification({ show: false })}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Select Students
                    </h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedStudents.length} selected
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or roll number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border rounded-lg"
                    />
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
                {isLoading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <tr>
                                <th className="p-3 text-left">Select</th>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Roll Number</th>
                                <th className="p-3 text-left">Department</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.map((student) => (
                                <tr key={student._id}
                                    className={`hover:bg-gray-50 transition-colors
                                        ${selectedStudents.includes(student._id) ? 'bg-indigo-50' : ''}`}>
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(student._id)}
                                                onChange={() => handleCheckboxChange(student._id)}
                                                className="rounded border-gray-300"
                                            />
                                            {selectedStudents.includes(student._id) && (
                                                <Check className="h-4 w-4 text-indigo-600 ml-2" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">{student.fullName}</td>
                                    <td className="p-3">{student.studentId}</td>
                                    <td className="p-3">{student.department}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleConfirm}
                    disabled={selectedStudents.length === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    Confirm Selection ({selectedStudents.length})
                </button>
            </div>
        </div>
    );
}

export default AddStudents;
