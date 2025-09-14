import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { backendUrl } from '../../../utils/routes';
import { jwtDecode } from 'jwt-decode';
import { FiUsers, FiCheck, FiX, FiSave, FiUserPlus, FiUserMinus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const TeamAttendanceMarking = () => {
    const { eventId, teamId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teamAttendance, setTeamAttendance] = useState([]);
    const [teamComment, setTeamComment] = useState('');
    const [groupPoints, setGroupPoints] = useState(0);
    const [updateStatus, setUpdateStatus] = useState('');
    const [isCoordinator, setIsCoordinator] = useState(true); // Set default to true to always allow access
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showEditTeamModal, setShowEditTeamModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('jwtToken');
    const decodedToken = token ? jwtDecode(token) : null;

    console.log("TeamAttendanceMarking loaded with eventId:", eventId, "and teamId:", teamId);

    // Use useCallback to memoize the fetch function to prevent infinite loop
    const fetchTeamAndEvent = useCallback(async () => {
        try {
            setLoading(true);
            console.log("Fetching event data for ID:", eventId);

            // Fetch event details
            const eventResponse = await axios.get(`${backendUrl}/api/v1/club/events`, {
                params: { id: eventId },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (eventResponse.data && eventResponse.data.event) {
                const eventData = eventResponse.data.event;
                setEvent(eventData);

                // Check if user is coordinator for this event using userId from decodedToken
                if (decodedToken?.userId) {
                    const userId = decodedToken.userId;
                    const isEventCoordinator = eventData.clubIds.some(club => {
                        const clubId = typeof club === 'object' ? (club._id || club.id) : club;
                        return clubId === userId;
                    });

                    setIsCoordinator(isEventCoordinator);
                }
            }

            // Fetch team details
            const teamResponse = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                params: { teamId },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (teamResponse.data && teamResponse.data.team) {
                const teamData = teamResponse.data.team;
                setTeam(teamData);
                setTeamComment(teamData.comment || '');

                // Check if user is team leader
                const isTeamLeader = decodedToken?.userId === (teamData.leader._id || teamData.leader);

                // If user is neither coordinator nor team leader, show error
                if (!isCoordinator && !isTeamLeader) {
                    navigate(-1);
                    return;
                }

                const memberAttendancePromises = teamData.members.map(async (member) => {
                    try {
                        // Check if attendance record exists
                        const attendanceResponse = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                            params: {
                                studentId: member._id,
                                eventId,
                                teamId
                            },
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (attendanceResponse.data && attendanceResponse.data.records && attendanceResponse.data.records.length > 0) {
                            const record = attendanceResponse.data.records[0];
                            return {
                                memberId: member._id,
                                name: member.fullName || 'Student',
                                email: member.email,
                                photo: member.photo || null,
                                status: record.status || 'absent',
                                pointsGiven: record.pointsGiven || 0,
                                comment: record.comment || '',
                                isLeader: teamData.leader._id === member._id
                            };
                        }

                        return {
                            memberId: member._id,
                            name: member.fullName || 'Student',
                            email: member.email,
                            photo: member.photo || null,
                            status: 'absent',
                            pointsGiven: 0,
                            comment: '',
                            isLeader: teamData.leader._id === member._id
                        };
                    } catch (error) {
                        console.error("Error fetching attendance for member:", error);
                        return {
                            memberId: member._id,
                            name: member.fullName || 'Student',
                            email: member.email,
                            photo: member.photo || null,
                            status: 'absent',
                            pointsGiven: 0,
                            comment: '',
                            isLeader: teamData.leader._id === member._id
                        };
                    }
                });

                const attendanceRecords = await Promise.all(memberAttendancePromises);
                setTeamAttendance(attendanceRecords);

                const totalPoints = Math.max(...attendanceRecords.map(record => record.pointsGiven), 0);
                setGroupPoints(Math.round(totalPoints));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            navigate(-1); // Navigate back on error
        } finally {
            setLoading(false);
        }
    }, [eventId, teamId, token, decodedToken?.userId, navigate]);

    // Use the useCallback function in useEffect
    useEffect(() => {
        // Only fetch data once when the component mounts or dependencies change
        fetchTeamAndEvent();
    }, [fetchTeamAndEvent]); // Only dependency is the memoized fetch function

    // Handle individual status change
    const handleStatusChange = (index, status) => {
        const updatedAttendance = [...teamAttendance];
        updatedAttendance[index].status = status;

        // Reset points to 0 if status is 'absent'
        if (status === 'absent') {
            updatedAttendance[index].pointsGiven = 0;
        } else if (status === 'present') {
            // Always apply group points to present members
            updatedAttendance[index].pointsGiven = groupPoints;
        }

        setTeamAttendance(updatedAttendance);
    };

    // Handle group points change
    const handleGroupPointsChange = (value) => {
        const newGroupPoints = value === '' ? 0 : Math.max(0, parseInt(value) || 0); // Handle empty input as 0
        if (newGroupPoints !== groupPoints) {
            setGroupPoints(newGroupPoints); // Update state only if the value has changed
        }

        // Apply to all present members
        const updatedAttendance = teamAttendance.map(record => ({
            ...record,
            pointsGiven: record.status === 'present' ? newGroupPoints : 0
        }));
        setTeamAttendance(updatedAttendance);
    };

    // Handle individual comment change
    const handleCommentChange = (index, comment) => {
        const updatedAttendance = [...teamAttendance];
        updatedAttendance[index].comment = comment;
        setTeamAttendance(updatedAttendance);
    };

    // Mark all as present/absent
    const markAllAs = (status) => {
        const updatedAttendance = teamAttendance.map(record => ({
            ...record,
            status,
            pointsGiven: status === 'present' ? groupPoints : 0
        }));

        setTeamAttendance(updatedAttendance);

        // Explicitly update group points to 0 if marking all as absent
        if (status === 'absent') {
            setGroupPoints(0);
        }
    };

    // Save attendance
    const saveAttendance = async () => {
        try {
            setSaving(true);
            setUpdateStatus('Saving attendance records...');
            // First, update the team comment
            await axios.put(
                `${backendUrl}/api/v1/eventTeam/${teamId}`,
                {
                    teamPoints: groupPoints,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        

            // Then update attendance for each member
            const attendance = teamAttendance.map(record => ({
                memberId: record.memberId,
                status: record.status,
                pointsGiven: record.pointsGiven,
                comment: record.comment
            }));
            await axios.put(
                `${backendUrl}/api/v1/eventTeam/${teamId}/attendance`,
                {
                    attendance,
                    teamComment,
                    teamPoints: groupPoints
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUpdateStatus('Attendance saved successfully!');
            setTimeout(() => {
                navigate(`/manage-event/participants/${eventId}`);
            }, 1500);

        } catch (error) {
            console.error("Error saving attendance:", error);
            setUpdateStatus(error.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    // Handle team deletion
    const handleDeleteTeam = async () => {
        if (!window.confirm("Are you sure you want to delete this team? All members and their attendance records will be deleted.")) {
            return;
        }

        try {
            await axios.delete(
                `${backendUrl}/api/v1/eventTeam/${teamId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Team deleted successfully");
            navigate(`/manage-event/participants/${eventId}`);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete team");
        }
    };

    // Function to fetch available students
    const fetchAvailableStudents = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/v1/club/non-participants`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { eventId },
            });

            setAvailableStudents(response.data.nonParticipants || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    // Function to add member to team
    const handleAddMember = async (studentId) => {
        try {
            await axios.put(`${backendUrl}/api/v1/eventTeam/${team._id}`, {
                members: [studentId]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh team data
            fetchTeamAndEvent();
            setShowAddMemberModal(false);
        } catch (error) {
            console.error('Error adding member:', error);
            alert(error.response?.data?.message || 'Failed to add member');
        }
    };

    // Function to remove member from team
    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        try {
            await axios.post(`${backendUrl}/api/v1/eventTeam/removeMember`, {
                teamId: team._id,
                memberId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh team data
            fetchTeamAndEvent();
        } catch (error) {
            console.error('Error removing member:', error);
            alert(error.response?.data?.message || 'Failed to remove member');
        }
    };

    // Function to update team name
    const handleUpdateTeamName = async () => {
        try {
            await axios.put(`${backendUrl}/api/v1/eventTeam/${team._id}`, {
                teamName: newTeamName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh team data
            fetchTeamAndEvent();
            setShowEditTeamModal(false);
        } catch (error) {
            console.error('Error updating team:', error);
            alert(error.response?.data?.message || 'Failed to update team');
        }
    };

    // Replace error display with simple loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-violet-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                    <p className="text-indigo-600 dark:text-indigo-400">Loading team data...</p>
                </div>
            </div>
        );
    }

    // Add this inside your return statement, after the event header card
    const teamManagementSection = (
        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-200">Team Management</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setNewTeamName(team?.teamName || '');
                            setShowEditTeamModal(true);
                        }}
                        className="flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                    >
                        <FiEdit2 className="mr-2" /> Edit Team
                    </button>
                    <button
                        onClick={() => {
                            fetchAvailableStudents();
                            setShowAddMemberModal(true);
                        }}
                        className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                        <FiUserPlus className="mr-2" /> Add Member
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">Team Code</h4>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded font-mono text-indigo-600 dark:text-indigo-300">
                            {team?.shareId}
                        </span>
                        <button
                            onClick={() => navigator.clipboard.writeText(team?.shareId)}
                            className="text-indigo-600 hover:text-indigo-700"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Add these modal components before the final return statement
    const addMemberModal = showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Add Team Member</h3>
                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Photo</th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availableStudents
                                .filter(student =>
                                    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    student.email.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(student => (
                                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                            <img
                                                src={student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}`}
                                                alt={student.fullName}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            {student.fullName}
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            {student.email}
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleAddMember(student._id)}
                                                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                                            >
                                                Add
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => setShowAddMemberModal(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    const editTeamModal = showEditTeamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Edit Team</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Team Name
                    </label>
                    <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setShowEditTeamModal(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdateTeamName}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-violet-950">
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Header Card */}
                <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30">
                    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <FiUsers className="mr-2" /> Team Attendance
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                {event?.eventName} | {team?.teamName}
                            </p>
                        </div>

                        {isCoordinator && (
                            <button
                                onClick={handleDeleteTeam}
                                className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                Delete Team
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            Back to Teams
                        </button>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-4">
                            <h3 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">Team Feedback</h3>
                            <textarea
                                value={teamComment}
                                onChange={(e) => setTeamComment(e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3 dark:bg-gray-700/50 dark:text-white text-sm"
                                rows="3"
                                placeholder="Add team comment or feedback (optional)"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Team Management Section */}
                {teamManagementSection}

                {/* Group Controls Card */}
                <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30 p-6">
                    <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-200 mb-4">Group Attendance Controls</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Group Actions
                            </label>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => markAllAs('present')}
                                    className="flex-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 py-2 px-4 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center justify-center"
                                >
                                    <FiCheck className="mr-2" /> Mark All Present
                                </button>
                                <button
                                    onClick={() => markAllAs('absent')}
                                    className="flex-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 py-2 px-4 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center"
                                >
                                    <FiX className="mr-2" /> Mark All Absent
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Team Points
                            </label>
                            <input
                                type="number"
                                value={groupPoints}
                                onChange={(e) => handleGroupPointsChange(e.target.value)}
                                min="0"
                                max={event?.maxPoints || 100}
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                                Points will be applied to all present team members
                            </p>
                        </div>
                    </div>
                </div>

                {/* Member Attendance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamAttendance.map((member, index) => (
                        <div
                            key={member.memberId}
                            className={`bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border 
                                ${member.isLeader
                                    ? "border-yellow-200 dark:border-yellow-700"
                                    : "border-indigo-100/50 dark:border-violet-900/30"}
                                overflow-hidden transition-all hover:shadow-xl`}
                        >
                            <div className={`px-4 py-3 flex justify-between items-center
                                ${member.isLeader
                                    ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                                    : "bg-gradient-to-r from-indigo-500 to-violet-500"}`}>
                                <h4 className="font-medium text-white flex items-center">
                                    {member.name}
                                    {member.isLeader && (
                                        <span className="ml-2 text-xs bg-white/30 px-2 py-0.5 rounded-full">
                                            Leader
                                        </span>
                                    )}
                                </h4>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center mb-4">
                                    <div className="mr-3">
                                        <img
                                            src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                                            alt={member.name}
                                            className="h-12 w-12 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-800"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={member.status}
                                            onChange={(e) => handleStatusChange(index, e.target.value)}
                                            className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                                        >
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Points
                                        </label>
                                        <div className="flex justify-center">
                                            <div className="w-16 h-16">
                                                <CircularProgressbar
                                                    value={(member.pointsGiven / (event?.maxPoints || 100)) * 100}
                                                    text={`${member.pointsGiven}`}
                                                    styles={buildStyles({
                                                        textSize: '30px',
                                                        pathColor: member.status === 'present'
                                                            ? `rgba(99, 102, 241, ${(member.pointsGiven / (event?.maxPoints || 100)) + 0.2})`
                                                            : '#d1d5db',
                                                        textColor: member.status === 'present' ? '#6366f1' : '#9ca3af',
                                                        trailColor: '#e0e7ff',
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Add member removal button to each member card */}
                                {!member.isLeader && (
                                    <button
                                        onClick={() => handleRemoveMember(member.memberId)}
                                        className="mt-2 w-full flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                    >
                                        <FiUserMinus className="mr-2" /> Remove Member
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save Button */}
                <div className="sticky bottom-6 flex justify-between items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30">
                    <div>
                        {updateStatus && (
                            <div className={`text-sm ${updateStatus.includes('successfully') ? 'text-green-600' : 'text-blue-600'}`}>
                                {updateStatus}
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveAttendance}
                            disabled={saving}
                            className={`px-6 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg flex items-center ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-600 hover:to-violet-700'}`}
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8-8-3.582-8-8zm2 0a6 6 0 1 1 12 0 6 6 0 0 1-12 0z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiSave className="mr-2" />
                                    Save Attendance
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Modals */}
                {addMemberModal}
                {editTeamModal}
            </div>
        </div>
    );
};

export default TeamAttendanceMarking;