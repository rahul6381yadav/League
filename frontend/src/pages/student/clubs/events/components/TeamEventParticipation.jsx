import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../../../../utils/routes";
import { jwtDecode } from "jwt-decode";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Mail, Trophy, Medal, Clock, AlertCircle, MessageCircle } from "lucide-react";
import { FaCalendarAlt, FaClock, FaUserCheck, FaUserTimes, FaMapMarkerAlt, FaUsers, FaChevronRight, FaCommentAlt } from "react-icons/fa";
import "react-circular-progressbar/dist/styles.css";

const token = localStorage.getItem("jwtToken");
let decodedToken = null;
if (token) {
    try {
        decodedToken = jwtDecode(token);
    } catch (error) {
        console.error("Error decoding JWT token:", error.message);
    }
}

const TeamEventParticipation = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userTeam, setUserTeam] = useState(null);
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [shareId, setShareId] = useState("");
    const [allTeams, setAllTeams] = useState([]);
    const [isEventEnded, setIsEventEnded] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Add state for comment popup
    const [commentPopup, setCommentPopup] = useState({
        visible: false,
        content: "",
        position: { x: 0, y: 0 }
    });

    // Add state for loading states of member actions
    const [deletingMemberId, setDeletingMemberId] = useState(null);
    const [isLeavingTeam, setIsLeavingTeam] = useState(false);
    const [isDeletingTeam, setIsDeletingTeam] = useState(false);

    // Add points calculation (like EventSignUp)
    const [maxPoints, setMaxPoints] = useState(100);

    // Attendance state
    const [teamsAttendance, setTeamsAttendance] = useState({});

    // Fetch event details and check if user is already in a team
    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                    params: { id },
                    headers: { Authorization: `Bearer ${token}` },
                });

                const eventData = response.data.event;
                setEvent(eventData);

                // Check if event has ended
                const now = new Date();
                const eventEndDate = eventData.endDate ? new Date(eventData.endDate) : null;
                if (eventEndDate && now > eventEndDate) {
                    setIsEventEnded(true);
                }

                // Set max points
                if (eventData && eventData.maxPoints) {
                    setMaxPoints(eventData.maxPoints);
                }

                // Fetch teams for this event
                const teamsResponse = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                    params: { eventId: id },
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (teamsResponse.data && teamsResponse.data.teams) {
                    const teams = teamsResponse.data.teams;
                    setAllTeams(teams);

                    // Fetch attendance for all teams
                    await fetchTeamsAttendance(teams);

                    // Check if current user is in any team
                    const currentUserTeam = teams.find(team =>
                        team.members.some(member => member._id === decodedToken?.userId || member === decodedToken?.userId)
                    );

                    if (currentUserTeam) {
                        setUserTeam(currentUserTeam);
                    }
                }
            } catch (error) {
                console.error("Error fetching event details:", error);
                setError(error.response?.data?.message || "Failed to load event details");
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    // Fetch team attendance
    const fetchTeamsAttendance = async (teams) => {
        try {
            const attendanceData = {};
            for (const team of teams) {
                const response = await axios.get(`${backendUrl}/api/v1/eventTeam/getAttendance/${team._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('response:', response);
                if (response.data && response.data.attendanceRecords.length > 0) {
                    //attendance records consists of array of 2 3 people so i want to store it accordingly
                    attendanceData[team._id] = {
                        attendance: response.data.attendanceRecords.map(record => ({
                            studentId: record.studentId._id || record.studentId,
                            status: record.status,
                            pointsGiven: record.pointsGiven || 0,
                            comments: record.comment || "",
                        })),
                    }
                }
                else {
                    console.log("no attendance records found for team:", team._id);
                }
            }
            // Log attendance data for debugging
            console.log("Attendance Data:", attendanceData);
            // Log teams for debugging
            console.log("Teams:", teams);
            // Set attendance data in state
            setTeamsAttendance(attendanceData);
        } catch (error) {
            console.error("Error fetching teams attendance:", error);
        }
    };

    // Handle create team
    const handleCreateTeam = async (e) => {
        e.preventDefault();

        if (!teamName.trim()) {
            alert("Please enter a team name");
            return;
        }

        try {
            const response = await axios.post(
                `${backendUrl}/api/v1/eventTeam/create`,
                {
                    teamName,
                    eventId: id
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data && response.data.team) {
                setUserTeam(response.data.team);
                setShowCreateTeamModal(false);

                // Refresh teams
                const teamsResponse = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                    params: { eventId: id },
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (teamsResponse.data && teamsResponse.data.teams) {
                    setAllTeams(teamsResponse.data.teams);
                }
            } else {
                alert("Failed to create team: Invalid response from server");
            }

        } catch (error) {
            alert(error.response?.data?.message || "Failed to create team");
        }
    };

    // Handle join team
    const handleJoinTeam = async (e) => {
        e.preventDefault();

        if (!shareId.trim()) {
            alert("Please enter a valid team code");
            return;
        }

        try {
            const response = await axios.post(
                `${backendUrl}/api/v1/eventTeam/join`,
                { shareId },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setUserTeam(response.data.team);
            setShowJoinTeamModal(false);

            // Refresh teams
            const teamsResponse = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                params: { eventId: id },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (teamsResponse.data && teamsResponse.data.teams) {
                setAllTeams(teamsResponse.data.teams);
            }

        } catch (error) {
            alert(error.response?.data?.message || "Failed to join team");
        }
    };

    // Handle removing a team member (for team leaders)
    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member from the team?")) {
            return;
        }

        setDeletingMemberId(memberId);

        try {
            const response = await axios.post(
                `${backendUrl}/api/v1/eventTeam/removeMember`,
                {
                    teamId: userTeam._id,
                    memberId
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setUserTeam(response.data.team);

            // Refresh teams
            const teamsResponse = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                params: { eventId: id },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (teamsResponse.data && teamsResponse.data.teams) {
                setAllTeams(teamsResponse.data.teams);
            }

        } catch (error) {
            alert(error.response?.data?.message || "Failed to remove team member");
        } finally {
            setDeletingMemberId(null);
        }
    };

    // Handle leaving a team (for regular members)
    const handleLeaveTeam = async () => {
        if (!window.confirm("Are you sure you want to leave this team?")) {
            return;
        }

        setIsLeavingTeam(true);

        try {
            await axios.post(
                `${backendUrl}/api/v1/eventTeam/leave`,
                { teamId: userTeam._id },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setUserTeam(null);

            // Refresh teams
            const teamsResponse = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                params: { eventId: id },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (teamsResponse.data && teamsResponse.data.teams) {
                setAllTeams(teamsResponse.data.teams);
            }

        } catch (error) {
            alert(error.response?.data?.message || "Failed to leave team");
        } finally {
            setIsLeavingTeam(false);
        }
    };

    // Handle deleting the entire team (for team leaders only)
    const handleDeleteTeam = async () => {
        if (!window.confirm("Are you sure you want to delete the entire team? This action cannot be undone.")) {
            return;
        }

        setIsDeletingTeam(true);

        try {
            await axios.delete(
                `${backendUrl}/api/v1/eventTeam/${userTeam._id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setUserTeam(null);

            // Refresh teams list
            const teamsResponse = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                params: { eventId: id },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (teamsResponse.data && teamsResponse.data.teams) {
                setAllTeams(teamsResponse.data.teams);
            }

            alert("Team deleted successfully");

        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete team");
        } finally {
            setIsDeletingTeam(false);
        }
    };

    // Format date for display
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

    // Function to share team code via social media
    const shareTeamCode = (platform) => {
        const message = `Join my team "${userTeam?.teamName}" for the event "${event?.eventName}"! Use code: ${userTeam?.shareId}`;
        let url;

        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
                break;
            case 'email':
                url = `mailto:?subject=Join my team for ${event?.eventName}&body=${encodeURIComponent(message)}`;
                break;
            default:
                // Copy to clipboard as fallback
                navigator.clipboard.writeText(message);
                alert("Team invitation message copied to clipboard!");
                return;
        }

        window.open(url, '_blank');
    };

    // Share modal component
    const ShareTeamModal = ({ userTeam, event, onClose, shareTeamCode }) => (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Share Team Code</h3>

                <div className="mb-6 text-center">
                    <div className="text-2xl font-mono bg-indigo-50 dark:bg-indigo-900/30 py-3 px-4 rounded-lg mb-2">
                        <span className="text-gray-900 dark:text-white font-bold">
                            {userTeam?.shareId || "Loading..."}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Share this code with friends to join your team
                    </p>
                </div>

                {/* Team comment if available */}
                {userTeam?.comment && (
                    <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Coordinator's Comment:</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{userTeam.comment}</p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <button
                        onClick={() => shareTeamCode('whatsapp')}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex flex-col items-center"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span className="text-xs mt-1">WhatsApp</span>
                    </button>
                    <button
                        onClick={() => shareTeamCode('telegram')}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex flex-col items-center"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                        <span className="text-xs mt-1">Telegram</span>
                    </button>
                    <button
                        onClick={() => shareTeamCode('email')}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg flex flex-col items-center"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-xs mt-1">Email</span>
                    </button>
                </div>

                <button
                    onClick={() => {
                        if (userTeam?.shareId) {
                            navigator.clipboard.writeText(userTeam.shareId);
                            alert("Team code copied to clipboard!");
                        } else {
                            alert("Team code not available");
                        }
                    }}
                    className="w-full bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 py-2 rounded-md mb-4"
                    disabled={!userTeam?.shareId}
                >
                    Copy Code
                </button>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    // Comment popup close on outside click (like EventSignUp)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (commentPopup.visible && !event.target.closest('.comment-popup')) {
                setCommentPopup(prev => ({ ...prev, visible: false }));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [commentPopup.visible]);

    // Get max points
    const getMaxPoints = () => event?.maxPoints || maxPoints || 100;

    // Update team points calculation to use teamsAttendance data
    const getTeamTotalPoints = () => {
        if (!userTeam?._id || !teamsAttendance[userTeam._id]) return 0;
        const attendance = teamsAttendance[userTeam._id].attendance || [];
        return Math.max(...attendance.map(record => record.pointsGiven || 0), 0);
    };

    // Update team points percentage calculation
    const getTeamPointsPercent = () => {
        const total = getTeamTotalPoints();
        const max = getMaxPoints();
        return Math.min(Math.round((total / max) * 100), 100);
    };

    // Calculate percentage for points display
    const calculatePercentage = (points) => {
        return Math.min(Math.round((points / maxPoints) * 100), 100);
    };

    // Handle comment click for popup
    const handleCommentClick = (comment, event) => {
        event.stopPropagation();
        event.preventDefault();

        if (!comment || comment.trim() === '') {
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = rect.left;
        const y = rect.top;

        setCommentPopup({
            visible: true,
            content: comment,
            position: { x, y }
        });
    };

    // Helper functions for team data
    const getTeamAttendance = (teamId) => {
        return teamsAttendance[teamId]?.attendance || [];
    };

    const getTeamPoints = (teamId) => {
        return teamsAttendance[teamId]?.points || 0;
    };

    const getStudentStatus = (teamId, studentId) => {
        const attendance = getTeamAttendance(teamId);
        const record = attendance.find(a => a.studentId === studentId);
        return record?.status || "absent";
    };

    const getStudentPoints = (teamId, studentId) => {
        const attendance = getTeamAttendance(teamId);
        const record = attendance.find(a => a.studentId === studentId);
        return record?.pointsGiven || 0;
    };

    // Computed properties
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 p-4">
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 p-8 w-full max-w-md">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-indigo-700 dark:text-indigo-300 font-medium">Loading event details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 p-4">
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100/50 dark:border-red-900/30 p-8 w-full max-w-md">
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100">Error Occurred</p>
                        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-6 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Determine if the current user is the team leader
    const isTeamLeader = userTeam &&
        (userTeam.leader._id === decodedToken.userId || userTeam.leader === decodedToken.userId);

    // Check if team is full
    const isTeamFull = userTeam && event &&
        Array.isArray(userTeam.members) && userTeam.members.length >= event.maxMember;

    // Check if event has started
    const hasEventStarted = () => {
        if (!event || !event.date) return false;
        const now = new Date();
        const eventDate = new Date(event.date);
        return now >= eventDate;
    };

    const eventStarted = hasEventStarted();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950">
            {/* Comment popup - same as EventSignUp */}
            {commentPopup.visible && commentPopup.content && (
                <div
                    className="comment-popup fixed z-50 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-indigo-200 dark:border-indigo-800 p-4 animate-fade-in"
                    style={{
                        left: `${commentPopup.position.x}px`,
                        top: `${commentPopup.position.y}px`,
                        maxWidth: '250px',
                        minWidth: '180px'
                    }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            Comment
                        </h4>
                        <button
                            onClick={() => setCommentPopup(prev => ({ ...prev, visible: false }))}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            &times;
                        </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {commentPopup.content}
                    </p>
                </div>
            )}

            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Event Poster/Banner - same as EventSignUp */}
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden transition-transform hover:shadow-xl">
                    <div className="relative w-full" style={{ paddingBottom: '40%' }}>
                        <div className="absolute inset-0">
                            {event && event.photo ? (
                                <img
                                    src={event.photo}
                                    alt="Event Banner"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center">
                                    <div className="text-center">
                                        <Trophy className="text-white/80 text-6xl mb-4 animate-pulse" />
                                        <h3 className="text-white text-xl font-bold tracking-wider">{event?.eventName || "LEAGUE EVENT"}</h3>
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        </div>
                    </div>
                    <div className="p-6">
                        {event ? (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                        {event.eventName}
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
                                            <span>{formatDateTime(event.date)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-indigo-700 dark:text-indigo-300 text-sm">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                                            <FaMapMarkerAlt className="text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs block">Venue</span>
                                            <span>{event.venue || "Not specified"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-indigo-700 dark:text-indigo-300 text-sm">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                                            <FaClock className="text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs block">Team Size</span>
                                            <span>Up to {event.maxMember} members</span>
                                        </div>
                                    </div>
                                </div>
                                {event.description && (
                                    <div className="mt-4 border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                            {event.description}
                                        </p>
                                    </div>
                                )}
                                {event.clubIds && event.clubIds.length > 0 && (
                                    <div className="mt-6 border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Collaborating Clubs:
                                        </h4>
                                        <div className="flex flex-wrap gap-3">
                                            {event.clubIds.map((club) => (
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

                {/* Team Participation Section */}
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 p-6">
                    <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">Team Participation</h2>
                    {isEventEnded ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Event has ended</h3>
                                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                        <p>This event has already concluded. Team formation is no longer available.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : userTeam ? (
                        // User has a team
                        <div>
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-6 mb-6">
                                {/* Team name and points */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20">
                                            <CircularProgressbar
                                                value={getTeamPointsPercent()}
                                                text={`${getTeamTotalPoints()}`}
                                                styles={buildStyles({
                                                    textSize: '28px',
                                                    pathColor: `rgba(99, 102, 241, ${getTeamPointsPercent() / 100 + 0.2})`,
                                                    textColor: '#6366F1',
                                                    trailColor: '#E0E7FF',
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{userTeam.teamName}</h3>
                                                {userTeam.leader._id === decodedToken.userId || userTeam.leader === decodedToken.userId ? (
                                                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded-full">Team Leader</span>
                                                ) : (
                                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">Member</span>
                                                )}
                                            </div>
                                            <div className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                                Team Code: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{userTeam.shareId}</span>
                                            </div>
                                            <div className="mt-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-0.5 rounded-full inline-block">
                                                {getTeamPointsPercent()}% of max points
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {isTeamLeader && !eventStarted && (
                                            <button
                                                onClick={handleDeleteTeam}
                                                disabled={isDeletingTeam}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                                            >
                                                {isDeletingTeam ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-4 4m0 0l-4-4m4 4V3"></path>
                                                        </svg>
                                                        Delete Team
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
                                            Team Chat
                                        </button>
                                    </div>
                                </div>
                                {/* Team members list */}
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Team Members</h4>
                                    <div className="space-y-3">
                                        {Array.isArray(userTeam.members) && userTeam.members.map((member, idx) => {
                                            const m = typeof member === "object" ? member : {};
                                            const status = getStudentStatus(userTeam._id, m._id);
                                            const points = getStudentPoints(userTeam._id, m._id);
                                            const pointsPercentage = calculatePercentage(points);

                                            return (
                                                <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-indigo-50/90 to-violet-50/90 dark:from-indigo-900/40 dark:to-violet-900/40 p-4 rounded-xl border border-indigo-100 dark:border-violet-800/50 hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={m.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                            alt={m.fullName}
                                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400 dark:ring-violet-500"
                                                        />
                                                        <div>
                                                            <div className="flex items-center">
                                                                <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                                                    {m.fullName || 'Unknown User'}
                                                                </h4>
                                                                {(m.comment || m.comments) && (
                                                                    <button
                                                                        className="ml-2 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-full"
                                                                        onClick={(e) => handleCommentClick(m.comment || m.comments, e)}
                                                                        title="View comment"
                                                                    >
                                                                        <FaCommentAlt size={12} className="animate-pulse" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-indigo-500 dark:text-indigo-400">
                                                                {m.studentId || m.rollNo || m.email || '-'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {isEventEnded && (
                                                            <div className="w-16 h-16">
                                                                <CircularProgressbar
                                                                    value={pointsPercentage}
                                                                    text={`${points}`}
                                                                    styles={buildStyles({
                                                                        textSize: '28px',
                                                                        pathColor: `rgba(99, 102,241, ${pointsPercentage / 100 + 0.2})`,
                                                                        textColor: '#6366F1',
                                                                        trailColor: '#E0E7FF',
                                                                    })}
                                                                />
                                                            </div>
                                                        )}
                                                        <span className={`relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                                                            ${status === 'present'
                                                                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                                                                : 'bg-gradient-to-r from-red-400 to-red-500 text-white'}`}
                                                        >
                                                            <span className="relative flex items-center">
                                                                {status === "present" ? (
                                                                    <>
                                                                        <FaUserCheck className="mr-1" /> Present
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FaUserTimes className="mr-1" /> Absent
                                                                    </>
                                                                )}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Team comment section */}
                                    {userTeam.comment && (
                                        <div className="mt-4 bg-gradient-to-r from-amber-50/90 to-yellow-50/90 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <MessageCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Team Feedback:</h4>
                                                    <p className="text-sm text-amber-700 dark:text-amber-400">{userTeam.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Team actions section */}
                                <div className="mt-6 pt-4 border-t border-indigo-100 dark:border-indigo-800/50">
                                    <div className="flex items-center justify-between">
                                        {!isTeamLeader && !eventStarted && (
                                            <button
                                                onClick={handleLeaveTeam}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center"
                                                disabled={isLeavingTeam}
                                            >
                                                {isLeavingTeam ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Leaving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                                        </svg>
                                                        Leave Team
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* Event status information */}
                                        {eventStarted && (
                                            <div className="text-amber-600 dark:text-amber-400 flex items-center">
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <span>Event has started - team modifications locked</span>
                                            </div>
                                        )}

                                        {/* Show share button only if team is not full */}
                                        {!isTeamFull ? (
                                            <div className="flex items-center ml-auto">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                                                    Share team code with others to join
                                                </span>
                                                <button
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                                                    onClick={() => setShowShareModal(true)}
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                                                    </svg>
                                                    Share Team
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-amber-600 dark:text-amber-400 flex items-center ml-auto">
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                                </svg>
                                                <span>Team is full ({userTeam.members.length}/{event.maxMember})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // User doesn't have a team
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-200 mb-4">Create a New Team</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Start your own team and invite others to join using a team code.</p>
                                <button
                                    onClick={() => setShowCreateTeamModal(true)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md transition-colors"
                                >
                                    Create Team
                                </button>
                            </div>

                            <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-4">Join an Existing Team</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Enter a team code shared with you to join an existing team.</p>
                                <button
                                    onClick={() => setShowJoinTeamModal(true)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
                                >
                                    Join Team
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Participating Teams Section */}
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Trophy size={24} className="text-white" />
                            <h2 className="text-xl font-semibold text-white">Participating Teams</h2>
                        </div>
                        <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                            {allTeams.length} Teams
                        </span>
                    </div>

                    <div className="p-4">
                        <div className="space-y-4">
                            {allTeams
                                .sort((a, b) => {
                                    const aPoints = teamsAttendance[a._id]?.attendance?.reduce((max, record) =>
                                        Math.max(max, record.pointsGiven || 0), 0) || 0;
                                    const bPoints = teamsAttendance[b._id]?.attendance?.reduce((max, record) =>
                                        Math.max(max, record.pointsGiven || 0), 0) || 0;
                                    return bPoints - aPoints;
                                })
                                .map((team, index) => {
                                    const isUserTeam = userTeam && userTeam._id === team._id;
                                    const teamAttendance = teamsAttendance[team._id]?.attendance || [];
                                    const maxTeamPoints = Math.max(...teamAttendance.map(record => record.pointsGiven || 0), 0);

                                    return (
                                        <div
                                            key={team._id}
                                            className={`relative bg-gradient-to-r ${isUserTeam
                                                ? 'from-indigo-50/90 to-violet-50/90 dark:from-indigo-900/40 dark:to-violet-900/40'
                                                : 'from-gray-50/90 to-gray-100/90 dark:from-gray-900/40 dark:to-gray-800/40'
                                                } rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/50 transition-all hover:shadow-md`}
                                        >
                                            {/* Rank Badge */}
                                            <div className="absolute -left-3 top-6 w-8 h-8 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full shadow-lg">
                                                <span className="text-sm font-bold">{index + 1}</span>
                                            </div>

                                            {/* Team Header with Comment */}
                                            <div className="ml-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16">
                                                        <CircularProgressbar
                                                            value={calculatePercentage(maxTeamPoints)}
                                                            text={`${maxTeamPoints}`}
                                                            styles={buildStyles({
                                                                textSize: '28px',
                                                                pathColor: `rgba(99, 102, 241, ${calculatePercentage(maxTeamPoints) / 100 + 0.2})`,
                                                                textColor: '#6366F1',
                                                                trailColor: '#E0E7FF',
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">
                                                                {team.teamName}
                                                            </h3>
                                                            {isUserTeam && (
                                                                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs px-2 py-1 rounded-full">
                                                                    Your Team
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {team.members?.length || 0} members · {calculatePercentage(maxTeamPoints)}% Achievement
                                                        </p>
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

                                            {/* Team Members Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {Array.isArray(team.members) && team.members.map((member, idx) => {
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
                                                                        <Trophy size={12} className="text-white" />
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
                                                                            <FaCommentAlt size={12} className="animate-pulse" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                                    ${memberAttendance?.status === 'present'
                                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                                        {memberAttendance?.status === 'present' ?
                                                                            <FaUserCheck className="mr-1" /> :
                                                                            <FaUserTimes className="mr-1" />
                                                                        }
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

                {/* Create Team Modal */}
                {showCreateTeamModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Create a New Team</h3>
                            <form onSubmit={handleCreateTeam}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Team Name</label>
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        placeholder="Enter your team name"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateTeamModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        Create Team
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Join Team Modal */}
                {showJoinTeamModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Join a Team</h3>
                            <form onSubmit={handleJoinTeam}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Team Code</label>
                                    <input
                                        type="text"
                                        value={shareId}
                                        onChange={(e) => setShareId(e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        placeholder="Enter the team code"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowJoinTeamModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Join Team
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Share Team Modal */}
                {showShareModal && <ShareTeamModal
                    userTeam={userTeam}
                    event={event}
                    onClose={() => setShowShareModal(false)}
                    shareTeamCode={shareTeamCode}
                />}
            </div>
            {/* Style block for animation and gradient (copied from EventSignUp) */}
            <style jsx>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
                .animate-gradient-text {
                    animation: gradient 3s ease infinite;
                    background-size: 300% 300%;
                }
                .animate-spin-slow {
                    animation: spin-slow 4s linear infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-in-out;
                }
            `}</style>
        </div >
    );
};


export default TeamEventParticipation;