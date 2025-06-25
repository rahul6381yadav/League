import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../../../utils/routes';
import { Search } from 'lucide-react';

const EventParticipants = () => {
    const { eventId } = useParams(); // Extract eventId from URL
    const [teamName, setTeamName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [availableStudents, setAvailableStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]); // Add filtered students state
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedLeader, setSelectedLeader] = useState('');
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        fetchAvailableStudents();
    }, []);

    useEffect(() => {
        // Filter students based on the search term
        setFilteredStudents(
            availableStudents.filter((student) =>
                student.fullName && student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, availableStudents]);

    const fetchAvailableStudents = async () => {
        setIsLoadingStudents(true);
        try {
            const response = await axios.get(`${backendUrl}/api/v1/club/non-participants`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { eventId },
            });
            setAvailableStudents(response.data.nonParticipants || []);
            setFilteredStudents(response.data.nonParticipants || []); // Initialize filtered students
            console.log('Available students:', response.data.nonParticipants);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoadingStudents(false);
        }
    };


    const handleStudentSelection = (studentId) => {
        setSelectedStudents((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
        if (selectedLeader === studentId && !selectedStudents.includes(studentId)) {
            setSelectedLeader(''); // Prevent deselecting leader without selecting another
        }
    };

    const handleCreateTeam = async () => {
        if (!teamName || !selectedLeader) {
            alert('Please provide a team name and select a leader.');
            return;
        }
        try {
            await axios.post(
                `${backendUrl}/api/v1/eventTeam/createTeam`,
                { teamName, eventId, leaderId: selectedLeader },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Team created successfully!');
            setTeamName('');
            setSelectedStudents([]);
            setSelectedLeader('');
            setIsModalOpen(false); // Close modal after successful creation
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create team');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
                Add Team
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-4xl">
                        <h1 className="text-xl font-bold mb-4">Create New Team</h1>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Enter team name"
                                className="w-full p-2 border rounded mb-4"
                                required
                            />
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 p-2 border rounded"
                                />
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-3 text-left">Select</th>
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-left">Student ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr key={student._id} className="border-t">
                                            <td className="p-3">
                                                <input
                                                    type="radio"
                                                    name="leader"
                                                    checked={selectedLeader === student._id}
                                                    onChange={() => setSelectedLeader(student._id)}
                                                />
                                            </td>
                                            <td className="p-3">{student.fullName}</td>
                                            <td className="p-3">{student.studentId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTeam}
                                disabled={!teamName || !selectedLeader} // Remove dependency on selectedStudents
                                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                            >
                                Create Team
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventParticipants;
