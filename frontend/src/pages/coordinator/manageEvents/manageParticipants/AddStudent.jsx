import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { backendUrl } from "../../../../utils/routes";
import axios from "axios";

function AddStudent({ eventId }) {
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [alreadyParticipants, setAlreadyParticipants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Increased to 10 students per page
    
    const token = localStorage.getItem("jwtToken");
    
    const fetchAlreadyParticipants = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/v1/club/events/${eventId}/participants`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAlreadyParticipants(response.data.participants);
        } catch (error) {
            console.error("Error fetching participants:", error.response?.data || error.message);
        }
    };

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${backendUrl}/user/profile?role=student&search=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            const result = await response.json();
            if (!result.isError) {
                setAllStudents(result.users);
                // Filter out students who are already participants
                // console.log("Participants", Participants);
                // const participantIds = Participants ? Participants.map(p => p.userId || p._id) : [];
                // setFilteredStudents(result.users.filter(student => !participantIds.includes(student._id)));

                //filer out those student who are in alreadyParticipants array
                console.log("Already Participants", alreadyParticipants);
                setFilteredStudents(result.users.filter(student => !alreadyParticipants.map(p => p.userId || p._id).includes(student._id)));
            } else {
                setError(result.message || "Failed to fetch students");
            }
        } catch (error) {
            setError("Error fetching students: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAlreadyParticipants();
        fetchStudents();
    }, [token, searchTerm]);
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
    
    const handleCheckboxChange = (studentId) => {
        setSelectedStudents((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const addParticipantsToEvent = async () => {
        if (selectedStudents.length === 0) {
            alert("Please select at least one student");
            return;
        }
        console.log("Selected students", selectedStudents);
        setIsLoading(true);
        try {
            const participationData = {
                participations: selectedStudents.map(studentId => ({
                    studentId: studentId,
                    eventId: eventId,
                    pointsGiven: 0,
                    status: "absent",
                    isWinner: false
                }))
            };
            console.log("Participation data", participationData);
            const response = await axios.post(
                `${backendUrl}/api/v1/club/attendance`, // Endpoint updated
                participationData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Response", response.data);
            alert("Successfully added students to the event!");
        } catch (error) {
            setError("Error adding students: " + error.response?.data || error.message);
            console.error("Error adding students:", error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    
    // Improved pagination display for many pages
    const renderPagination = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages are less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always include first page
            pageNumbers.push(1);
            
            // Calculate start and end of middle pages
            let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 2);
            let endPage = startPage + maxVisiblePages - 3; // -3 for first, last, and possible ellipsis
            
            // Adjust if near the end
            if (endPage >= totalPages) {
                endPage = totalPages - 1;
                startPage = Math.max(endPage - (maxVisiblePages - 3), 2);
            }
            
            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pageNumbers.push('...');
            }
            
            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            
            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pageNumbers.push('...');
            }
            
            // Always include last page
            pageNumbers.push(totalPages);
        }
        
        return pageNumbers.map((page, index) => 
            page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
            ) : (
                <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded mx-1 ${currentPage === page ? "bg-mirage-500 text-white" : "bg-mirage-200 text-black"}`}
                >
                    {page}
                </button>
            )
        );
    };
    
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-mirage-700 dark:text-mirage-200">Add Students to Event</h2>
            
            <div className="flex items-center gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border rounded w-1/3 bg-mirage-100 dark:bg-mirage-700 text-mirage-50 border-mirage-300"
                />
                <div className="ml-auto">
                    Selected {selectedStudents.length} students
                </div>
            </div>
            
            {error && <div className="text-red-500 mb-4">{error}</div>}
            
            {isLoading && !error ? (
                <div className="text-center">Loading students...</div>
            ) : (
                <table className="w-full border-collapse border border-mirage-300">
                    <thead>
                        <tr>
                            <th className="border p-2">Select</th>
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Roll Number</th>
                            <th className="border p-2">Department</th>
                            <th className="border p-2">Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((student) => (
                                <tr key={student._id} className={selectedStudents.includes(student._id) ? "bg-mirage-50 dark:bg-mirage-600" : ""}>
                                    <td className="border p-2 text-center">
                                        <input 
                                            type="checkbox"
                                            checked={selectedStudents.includes(student._id)}
                                            onChange={() => handleCheckboxChange(student._id)}
                                            className="bg-mirage-100"
                                        />
                                    </td>
                                    <td className="border p-2 truncate">{student.fullName || student.name}</td>
                                    <td className="border p-2">{student.studentId || student.rollNo || "N/A"}</td>
                                    <td className="border p-2">{student.department || "N/A"}</td>
                                    <td className="border p-2">{student.year || student.batchCode || "N/A"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-4 text-center border p-2">
                                    No students found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
            
            {totalPages > 0 && (
                <div className="mt-4 flex justify-center gap-2 flex-wrap">
                    <button 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded bg-mirage-300 text-black"
                    >
                        Prev
                    </button>
                    
                    {renderPagination()}
                    
                    <button 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded bg-mirage-300 text-black"
                    >
                        Next
                    </button>
                </div>
            )}
            
            <button
                className={`mt-6 px-6 py-2 rounded ${selectedStudents.length > 0 ? "bg-mirage-600 text-white" : "bg-mirage-300 text-black"}`}
                disabled={selectedStudents.length === 0 || isLoading}
                onClick={addParticipantsToEvent}
            >
                {isLoading ? "Adding..." : "Add Selected Students"}
            </button>
        </div>
    );
}

export default AddStudent;
