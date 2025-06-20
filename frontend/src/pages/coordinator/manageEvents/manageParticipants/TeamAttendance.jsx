import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { backendUrl } from '../../../../utils/routes';

const TeamAttendance = ({ teamId, onClose }) => {
    const [team, setTeam] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [teamComment, setTeamComment] = useState('');

    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                // Get team details
                const teamResponse = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                    params: { teamId },
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (teamResponse.data && teamResponse.data.team) {
                    const teamData = teamResponse.data.team;
                    setTeam(teamData);
                    setTeamComment(teamData.comment || '');

                    // Prepare attendance records for each member
                    const attendanceRecords = await Promise.all(
                        teamData.members.map(async (member) => {
                            try {
                                // Check if there's an existing attendance record
                                const attendanceResponse = await axios.get(
                                    `${backendUrl}/api/v1/club/attendance`, {
                                    params: {
                                        studentId: member._id,
                                        eventId: teamData.eventId._id,
                                        teamId: teamId
                                    },
                                    headers: { Authorization: `Bearer ${token}` }
                                }
                                );

                                const records = attendanceResponse.data.records;
                                if (records && records.length > 0) {
                                    return {
                                        memberId: member._id,
                                        name: member.fullName,
                                        email: member.email,
                                        status: records[0].status || 'absent',
                                        pointsGiven: records[0].pointsGiven || 0,
                                        comment: records[0].comment || '',
                                        attendanceId: records[0]._id
                                    };
                                }
                            } catch (err) {
                                console.error(`Error fetching attendance for member ${member._id}:`, err);
                            }

                            // Default if no attendance record is found
                            return {
                                memberId: member._id,
                                name: member.fullName,
                                email: member.email,
                                status: 'absent',
                                pointsGiven: 0,
                                comment: ''
                            };
                        })
                    );

                    setAttendance(attendanceRecords);
                }
            } catch (err) {
                console.error('Error fetching team data:', err);
                setError(err.response?.data?.message || 'Failed to load team data');
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [teamId, token]);

    const handleStatusChange = (index, status) => {
        const updatedAttendance = [...attendance];
        updatedAttendance[index].status = status;
        setAttendance(updatedAttendance);
    };

    const handlePointsChange = (index, points) => {
        const updatedAttendance = [...attendance];
        updatedAttendance[index].pointsGiven = points;
        setAttendance(updatedAttendance);
    };

    const handleCommentChange = (index, comment) => {
        const updatedAttendance = [...attendance];
        updatedAttendance[index].comment = comment;
        setAttendance(updatedAttendance);
    };

    const saveAttendance = async () => {
        try {
            setSaving(true);

            const attendanceData = attendance.map(record => ({
                memberId: record.memberId,
                status: record.status,
                pointsGiven: record.status === 'present' ? record.pointsGiven : 0,
                comment: record.comment
            }));

            await axios.put(
                `${backendUrl}/api/v1/eventTeam/${teamId}/attendance`,
                {
                    attendance: attendanceData,
                    teamComment: teamComment
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Attendance saved successfully');
            onClose();

        } catch (err) {
            console.error('Error saving attendance:', err);
            alert(err.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const calculatePercentage = (points) => {
        const maxPoints = team?.eventId?.maxPoints || 100;
        return Math.min(Math.round((points / maxPoints) * 100), 100);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 rounded-md text-gray-800 hover:bg-gray-300"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-purple-700 dark:text-purple-400">
                Team Attendance: {team?.teamName}
            </h2>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Team Comment (visible to all team members)
                </label>
                <textarea
                    value={teamComment}
                    onChange={e => setTeamComment(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Add notes or feedback for the team..."
                ></textarea>
            </div>

            <div className="mb-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Member
                            </th>
                            <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Points
                            </th>
                            <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Comment
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {attendance.map((member, index) => (
                            <tr key={member.memberId}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {member.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {member.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={member.status}
                                        onChange={e => handleStatusChange(index, e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="present">Present</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="w-full flex items-center">
                                        <div style={{ width: 80, height: 80 }}>
                                            <CircularProgressbar
                                                value={calculatePercentage(member.pointsGiven)}
                                                text={`${member.pointsGiven}`}
                                                styles={buildStyles({
                                                    textSize: '28px',
                                                    pathColor: `rgba(147, 51, 234, ${calculatePercentage(member.pointsGiven) / 100 + 0.2})`,
                                                    textColor: '#9333EA',
                                                    trailColor: '#F3E8FF',
                                                })}
                                            />
                                        </div>
                                        <input
                                            type="number"
                                            value={member.pointsGiven}
                                            onChange={e => handlePointsChange(index, parseInt(e.target.value) || 0)}
                                            className="ml-4 block w-24 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            min="0"
                                            max={team?.eventId?.maxPoints || 100}
                                            disabled={member.status !== 'present'}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="text"
                                        value={member.comment}
                                        onChange={e => handleCommentChange(index, e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Add comment..."
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    onClick={saveAttendance}
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>
        </div>
    );
};

export default TeamAttendance;
