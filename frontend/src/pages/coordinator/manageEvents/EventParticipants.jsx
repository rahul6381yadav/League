import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../../../utils/routes';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Search } from 'lucide-react';
import 'react-circular-progressbar/dist/styles.css';
import { Mail, Trophy, Medal, Clock, MessageCircle } from "lucide-react";
import { FaCalendarAlt, FaClock, FaUserCheck, FaUserTimes, FaMapMarkerAlt, FaUsers, FaChevronRight, FaCommentAlt } from "react-icons/fa";
const EventParticipants = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [availableStudents, setAvailableStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedLeader, setSelectedLeader] = useState('');
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allTeams, setAllTeams] = useState([]);
    const [eventDetails, setEventDetails] = useState(null);
    const [commentPopup, setCommentPopup] = useState({ visible: false, content: '', position: { x: 0, y: 0 } });
    const [teamsAttendance, setTeamsAttendance] = useState({});
    const token = localStorage.getItem('jwtToken');
    const [isEventEnded, setIsEventEnded] = useState(false);

    useEffect(() => {
        fetchAvailableStudents();
        fetchEventDetails();
        fetchTeams();
    }, []);

    useEffect(() => {
        setFilteredStudents(
            availableStudents.filter((student) =>
                student.fullName && student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, availableStudents]);

    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const fetchAvailableStudents = async () => {
        setIsLoadingStudents(true);
        try {
            const response = await axios.get(`${backendUrl}/api/v1/club/non-participants`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { eventId },
            });
            setAvailableStudents(response.data.nonParticipants || []);
            setFilteredStudents(response.data.nonParticipants || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    const fetchEventDetails = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                params: { id: eventId },
                headers: { Authorization: `Bearer ${token}` },
            });
            setEventDetails(response.data.event);
            const now = new Date();
            const eventEndDate = response.data.event.endDate ? new Date(response.data.event.endDate) : null;
            if (eventEndDate && now > eventEndDate) {
                setIsEventEnded(true);
            }
        } catch (error) {
            console.error('Error fetching event details:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                params: { eventId },
                headers: { Authorization: `Bearer ${token}` },
            });
            const teams = response.data.teams || [];
            setAllTeams(teams);
            await fetchTeamsAttendance(teams); // Fetch attendance for all teams
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const fetchTeamsAttendance = async (teams) => {
        try {
            const attendanceData = {};
            for (const team of teams) {
                const response = await axios.get(`${backendUrl}/api/v1/eventTeam/getAttendance/${team._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                attendanceData[team._id] = {
                    attendance: response.data.attendanceRecords.map(record => ({
                        studentId: record.studentId._id || record.studentId,
                        status: record.status,
                        pointsGiven: record.pointsGiven || 0,
                        comments: record.comment || "",
                    })),
                };
            }
            setTeamsAttendance(attendanceData);
        } catch (error) {
            console.error('Error fetching teams attendance:', error);
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
            setSelectedLeader('');
            setIsModalOpen(false);
            fetchTeams();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create team');
        }
    };

    const handleCommentClick = (comment, event) => {
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        setCommentPopup({
            visible: true,
            content: comment,
            position: { x: rect.left, y: rect.top },
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (commentPopup.visible && !event.target.closest('.comment-popup')) {
                setCommentPopup({ visible: false, content: '', position: { x: 0, y: 0 } });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [commentPopup.visible]);

    const calculatePercentage = (points, maxPoints) => {
        return Math.min(Math.round((points / maxPoints) * 100), 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950">
            {commentPopup.visible && (
                <div
                className="comment-popup fixed z-50 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-indigo-200 dark:border-indigo-800 p-4 animate-fade-in"
                style={{
                        left: `${commentPopup.position.x}px`,
                        top: `${commentPopup.position.y}px`,
                        maxWidth: '250px',
                        minWidth: '180px',
                    }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            Comment
                        </h4>
                        <button
                            onClick={() => setCommentPopup({ visible: false, content: '', position: { x: 0, y: 0 } })}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            &times;
                        </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{commentPopup.content}</p>
                </div>
            )}
            <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden transition-transform hover:shadow-xl">
                <div className="relative w-full" style={{ paddingBottom: '40%' }}>
                    <div className="absolute inset-0">
                    {eventDetails && eventDetails.photo ? (
                        <img
                            src={eventDetails.photo}
                            alt="Event Banner"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.style.background = 'linear-gradient(to br, #6366F1, #8B5CF6, #9333EA)';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center">
                                <div className="text-center">
                                    <Trophy className="text-white/80 text-6xl mb-4 animate-pulse" />
                                    <h3 className="text-white text-xl font-bold tracking-wider">{eventDetails?.eventName || "LEAGUE EVENT"}</h3>
                                </div>
                        </div>
                    )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    </div>
            </div>
            <div className="p-6">
                {eventDetails ? (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                {eventDetails.eventName || "Event Name Not Available"}
                            </h1>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-medium border border-indigo-200/50 dark:border-violet-700/30">
                                    Team Event
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border 
                                        ${isEventEnded
                                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200/50 dark:border-red-700/30"
                                        : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200/50 dark:border-green-700/30"
                                    }`}>
                                    {isEventEnded ? "Ended" : "Active"}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-indigo-700 dark:text-indigo-300 text-sm">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                                    <FaCalendarAlt className="text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs block">Date & Time</span>
                                    <span>{formatDateTime(eventDetails.date) || "Not Available"}</span>
                                </div>
                            </div>
                            <div className="flex items-center text-indigo-700 dark:text-indigo-300 text-sm">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                                    <FaMapMarkerAlt className="text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs block">Venue</span>
                                    <span>{eventDetails.venue || "Not specified"}</span>
                                </div>
                            </div>
                            <div className="flex items-center text-indigo-700 dark:text-indigo-300 text-sm">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                                    <FaClock className="text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs block">Team Size</span>
                                    <span>Up to {eventDetails.maxMember || "N/A"} members</span>
                                </div>
                            </div>
                        </div>
                        {eventDetails.description && (
                            <div className="mt-4 border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {eventDetails.description}
                                </p>
                            </div>
                        )}
                        {eventDetails.clubIds && eventDetails.clubIds.length > 0 && (
                            <div className="mt-6 border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Collaborating Clubs:
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {eventDetails.clubIds.map((club) => (
                                        <div key={club._id} className="flex items-center bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                                            {club.image && (
                                                <img
                                                    src={club.image}
                                                    alt={club.name}
                                                    className="w-6 h-6 rounded-full object-cover mr-2"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            )}
                                            <span className="text-sm text-indigo-700 dark:text-indigo-300">{club.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </>
                ) : (
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-indigo-200/50 dark:bg-indigo-800/30 rounded w-2/3"></div>
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-indigo-200/50 dark:bg-indigo-800/30 mr-3"></div>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-indigo-200/50 dark:bg-indigo-800/30 rounded w-12"></div>
                                        <div className="h-3 bg-indigo-200/50 dark:bg-indigo-800/30 rounded w-20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            </div>

            <div className="flex justify-end mt-4 px-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                    Add Team
                </button>
            </div>

            {/* Participating Teams Section */}
            <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Participating Teams</h2>
                    <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                        {allTeams.length} Teams
                    </span>
                </div>
                <div className="p-4">
                    <div className="space-y-4">
                        {allTeams.map((team, index) => {
                            const maxPoints = eventDetails?.maxPoints || 100;
                            const teamAttendance = teamsAttendance[team._id]?.attendance || [];
                            const teamPoints = Math.max(...teamAttendance.map(record => record.pointsGiven || 0), 0);
                            const pointsPercentage = calculatePercentage(teamPoints, maxPoints);

                            return (
                                <div
                                    key={team._id}
                                    className="bg-gradient-to-r from-gray-50/90 to-gray-100/90 dark:from-gray-900/40 dark:to-gray-800/40 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/50 transition-all hover:shadow-md cursor-pointer"
                                    onClick={() => navigate(`/manage-event/${eventId}/team/${team._id}/attendance`)}// /manage-event/:eventId/team/:teamId/attendance
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16">
                                                <CircularProgressbar
                                                    value={pointsPercentage}
                                                    text={`${teamPoints}`}
                                                    styles={buildStyles({
                                                        textSize: '28px',
                                                        pathColor: `rgba(99, 102, 241, ${pointsPercentage / 100 + 0.2})`,
                                                        textColor: '#6366F1',
                                                        trailColor: '#E0E7FF',
                                                    })}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">{team.teamName}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{team.members?.length || 0} members</p>
                                            </div>
                                        </div>
                                        {team.comment && (
                                            <button
                                                onClick={(e) => handleCommentClick(team.comment, e)}
                                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-amber-600"
                                            >
                                                <MessageCircle size={16} className="mr-1 animate-pulse" />
                                                <span className="text-sm font-bold tracking-wider">FEEDBACK</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                        {team.members.map((member, idx) => {
                                            const memberAttendance = teamAttendance.find(a => a.studentId === (member._id || member));
                                            const isLeader = team.leader._id === (member._id || member);

                                            return (
                                                <div key={idx} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                                    <div className="relative">
                                                        <img
                                                            src={member.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                            alt={member.fullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        {isLeader && (
                                                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1" title="Team Leader">
                                                                <MessageCircle size={12} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {member.fullName || 'Unknown Member'}
                                                            </div>
                                                            {(member.comment || memberAttendance?.comments) && (
                                                                <button
                                                                    onClick={(e) => handleCommentClick(member.comment || memberAttendance.comments, e)}
                                                                    className="ml-2 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-full"
                                                                    title="View comment"
                                                                >
                                                                    <MessageCircle size={12} className="animate-pulse" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                            ${memberAttendance?.status === 'present'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                                {memberAttendance?.status === 'present' ? 'Present' : 'Absent'}
                                                            </span>
                                                            {memberAttendance?.pointsGiven > 0 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                                    {memberAttendance.pointsGiven} pts
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                </div>

            {/* Modal for Adding Team */}
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
                                disabled={!teamName || !selectedLeader}
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
