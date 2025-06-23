import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { backendUrl } from '../../../utils/routes';
import { jwtDecode } from 'jwt-decode';
import { FiUsers, FiCheck, FiX, FiSave } from 'react-icons/fi';

const TeamAttendanceMarking = () => {
    const { eventId, teamId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [teamAttendance, setTeamAttendance] = useState([]);
    const [teamComment, setTeamComment] = useState('');
    const [groupPoints, setGroupPoints] = useState(0);
    const [updateStatus, setUpdateStatus] = useState('');
    const [isCoordinator, setIsCoordinator] = useState(true); // Set default to true to always allow access

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
                    setError("Only coordinators or team leaders can access this page.");
                    setLoading(false);
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

                // Set initial group points to average of existing points
                const totalPoints = attendanceRecords.reduce((sum, record) => sum + record.pointsGiven, 0);
                if (attendanceRecords.length > 0) {
                    setGroupPoints(Math.round(totalPoints / attendanceRecords.length));
                } else {
                    setGroupPoints(0);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.response?.data?.message || "Failed to load team data");
        } finally {
            setLoading(false);
        }
    }, [eventId, teamId, token, decodedToken?.userId]); // Note the stable dependencies

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
        const newGroupPoints = Math.max(0, parseInt(value) || 0);
        setGroupPoints(newGroupPoints);

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
    };

    // Save attendance
    const saveAttendance = async () => {
        try {
            setSaving(true);
            setUpdateStatus('Saving attendance records...');

            // First, update the team comment
            await axios.put(
                `${backendUrl}/api/v1/eventTeam/${teamId}`,
                { comment: teamComment },
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
                    teamComment
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUpdateStatus('Attendance saved successfully!');
            setTimeout(() => {
                navigate(`/manage-event/${eventId}/participants`);
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
            navigate(`/manage-event/${eventId}/participants`);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete team");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Go Back
                </button>
            </div>
        );
    }

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

                                <div className="mt-3">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Comment
                                    </label>
                                    <input
                                        type="text"
                                        value={member.comment}
                                        onChange={(e) => handleCommentChange(index, e.target.value)}
                                        placeholder="Optional comment"
                                        className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                                    />
                                </div>
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
                            className={`px-6 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg flex items-center ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-600 hover:to-violet-700'}`
                            }
                        >
                            <FiSave className="mr-2" /> Save Attendance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamAttendanceMarking;