import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../../../../utils/routes";
import { jwtDecode } from "jwt-decode";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Mail, Trophy, Medal, Clock, AlertCircle, MessageCircle } from "lucide-react";
import { FaCalendarAlt, FaClock, FaUserCheck, FaUserTimes, FaMapMarkerAlt, FaUsers, FaChevronRight, FaCommentAlt } from "react-icons/fa";
import "react-circular-progressbar/dist/styles.css";
import ReactMarkdown from "react-markdown";

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
            weekday: "short",
            month: "short",
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
                navigator.clipboard.writeText(message);
                alert("Team invitation message copied to clipboard!");
                return;
        }

        window.open(url, '_blank');
    };

    // Share modal component
    const ShareTeamModal = ({ userTeam, event, onClose, shareTeamCode }) => (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 w-full max-w-sm mx-4 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Share Team Code</h3>

                <div className="mb-4 text-center">
                    <div className="text-xl font-mono bg-indigo-50 dark:bg-indigo-900/30 py-2 px-3 rounded-lg mb-2">
                        <span className="text-gray-900 dark:text-white font-bold">
                            {userTeam?.shareId || "Loading..."}
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Share this code with friends to join your team
                    </p>
                </div>

                {userTeam?.comment && (
                    <div className="mb-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <h4 className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">Coordinator's Comment:</h4>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{userTeam.comment}</p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 mb-3">
                    <button
                        onClick={() => shareTeamCode('whatsapp')}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex flex-col items-center text-xs"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                    </button>
                    <button
                        onClick={() => shareTeamCode('telegram')}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex flex-col items-center text-xs"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                        Telegram
                    </button>
                    <button
                        onClick={() => shareTeamCode('email')}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg flex flex-col items-center text-xs"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        Email
                    </button>
                </div>

                <button
                    onClick={() => {
                        if (userTeam?.shareId) {
                            navigator.clipboard.writeText(userTeam.shareId);
                            alert("Team code copied to clipboard!");
                        }
                    }}
                    className="w-full bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 py-2 rounded-lg mb-3 text-sm"
                >
                    Copy Code
                </button>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                    Close
                </button>
            </div>
        </div>
    );

    // Comment popup close on outside click
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 p-6 w-full max-w-xs">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                        <p className="mt-3 text-indigo-700 dark:text-indigo-300 font-medium text-sm">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-red-100/50 dark:border-red-900/30 p-6 w-full max-w-sm">
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="mt-3 text-base font-semibold text-gray-800 dark:text-gray-100">Error Occurred</p>
                        <p className="mt-1 text-center text-gray-600 dark:text-gray-400 text-sm">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isTeamLeader = userTeam && (userTeam.leader._id === decodedToken.userId || userTeam.leader === decodedToken.userId);
    const isTeamFull = userTeam && event && Array.isArray(userTeam.members) && userTeam.members.length >= event.maxMember;
    const hasEventStarted = () => {
        if (!event || !event.date) return false;
        const now = new Date();
        const eventDate = new Date(event.date);
        return now >= eventDate;
    };
    const eventStarted = hasEventStarted();

    return (
    <div className="min-h-screen">
        {/* Comment popup */}
        {commentPopup.visible && commentPopup.content && (
            <div
                className="comment-popup fixed z-50 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-indigo-200 dark:border-indigo-800 p-3 animate-fade-in"
                style={{
                    left: `${commentPopup.position.x}px`,
                    top: `${commentPopup.position.y}px`,
                    maxWidth: '200px',
                    minWidth: '150px'
                }}
            >
                <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                        <MessageCircle className="inline w-3 h-3 mr-1" />
                        Comment
                    </h4>
                    <button
                        onClick={() => setCommentPopup(prev => ({ ...prev, visible: false }))}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                    >
                        ×
                    </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-xs">{commentPopup.content}</p>
            </div>
        )}

        <div className="container mx-auto px-4 py-4 space-y-4 max-w-6xl">
            {/* Compact Event Header */}
            <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden">
                <div className="relative h-32 md:h-40">
                    {event && event.photo ? (
                        <img
                            src={event.photo}
                            alt="Event Banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center">
                            <Trophy className="text-white/80 text-3xl" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4">
                        <h1 className="text-lg md:text-xl font-bold text-white truncate">{event?.eventName}</h1>
                        <div className="flex flex-wrap gap-1 mt-1">
                            <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs">
                                Team Event
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${isEventEnded
                                ? "bg-red-500/80 text-white"
                                : "bg-green-500/80 text-white"
                                }`}>
                                {isEventEnded ? "Ended" : "Active"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Compact Event Details */}
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center text-xs">
                            <FaCalendarAlt className="text-indigo-500 mr-2" />
                            <div>
                                <div className="text-gray-500 dark:text-gray-400">Date</div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {formatDateTime(event?.date)?.split(',')[0]}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center text-xs">
                            <FaClock className="text-indigo-500 mr-2" />
                            <div>
                                <div className="text-gray-500 dark:text-gray-400">Time</div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {formatDateTime(event?.date)?.split(',')[1]?.trim()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center text-xs">
                            <FaMapMarkerAlt className="text-indigo-500 mr-2" />
                            <div>
                                <div className="text-gray-500 dark:text-gray-400">Venue</div>
                                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {event?.venue || "TBA"}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center text-xs">
                            <FaUsers className="text-indigo-500 mr-2" />
                            <div>
                                <div className="text-gray-500 dark:text-gray-400">Team Size</div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    Max {event?.maxMember}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Description */}
                    {event?.description && (
                        <div className="border-t border-indigo-100 dark:border-indigo-900/30 pt-3">
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200">
                                    <span>Event Description</span>
                                    <FaChevronRight className="transform group-open:rotate-90 transition-transform" />
                                </summary>
                                <div className="mt-2 prose prose-sm max-w-none text-gray-700 dark:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                                    <ReactMarkdown>{event.description}</ReactMarkdown>
                                </div>
                            </details>
                        </div>
                    )}

                    {/* Collaborating Clubs - Compact */}
                    {event?.clubIds && event.clubIds.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/30">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Clubs:</span>
                            <div className="flex flex-wrap gap-1">
                                {event.clubIds.map((club) => (
                                    <div key={club._id} className="flex items-center bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                                        {club.image && (
                                            <img
                                                src={club.image}
                                                alt={club.name}
                                                className="w-4 h-4 rounded-full object-cover mr-1"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <span className="text-xs text-indigo-700 dark:text-indigo-300">{club.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Compact Team Participation Section */}
            <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 p-4">
                <h2 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-3">Team Participation</h2>
                
                {isEventEnded ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
                            <div>
                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Event Ended</h3>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                    Team formation is no longer available.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : userTeam ? (
                    // Compact User Team Display
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4">
                        {/* Team Header - Compact */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12">
                                    <CircularProgressbar
                                        value={getTeamPointsPercent()}
                                        text={`${getTeamTotalPoints()}`}
                                        styles={buildStyles({
                                            textSize: '32px',
                                            pathColor: `rgba(99, 102, 241, ${getTeamPointsPercent() / 100 + 0.2})`,
                                            textColor: '#6366F1',
                                            trailColor: '#E0E7FF',
                                        })}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">{userTeam.teamName}</h3>
                                        {isTeamLeader && (
                                            <Trophy className="w-4 h-4 text-yellow-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <span>Code: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{userTeam.shareId}</code></span>
                                        <span className="text-purple-600 dark:text-purple-400">
                                            {getTeamPointsPercent()}% Achievement
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {!isTeamFull && (
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
                                    >
                                        Invite
                                    </button>
                                )}
                                {isTeamLeader && !eventStarted && (
                                    <button
                                        onClick={handleDeleteTeam}
                                        disabled={isDeletingTeam}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
                                    >
                                        {isDeletingTeam ? "..." : "Delete"}
                                    </button>
                                )}
                                {!isTeamLeader && !eventStarted && (
                                    <button
                                        onClick={handleLeaveTeam}
                                        disabled={isLeavingTeam}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
                                    >
                                        {isLeavingTeam ? "..." : "Leave"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Compact Team Members */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Members ({userTeam.members?.length}/{event?.maxMember})</h4>
                            <div className="grid gap-2">
                                {Array.isArray(userTeam.members) && userTeam.members.map((member, idx) => {
                                    const m = typeof member === "object" ? member : {};
                                    const status = getStudentStatus(userTeam._id, m._id);
                                    const points = getStudentPoints(userTeam._id, m._id);

                                    return (
                                        <div key={idx} className="flex items-center justify-between bg-white/70 dark:bg-gray-800/50 p-2 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={m.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                    alt={m.fullName}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {m.fullName || 'Unknown User'}
                                                        </span>
                                                        {(m.comment || m.comments) && (
                                                            <button
                                                                onClick={(e) => handleCommentClick(m.comment || m.comments, e)}
                                                                className="text-indigo-500 p-0.5 rounded"
                                                            >
                                                                <FaCommentAlt size={10} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">{m.studentId || m.rollNo || '-'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {isEventEnded && points > 0 && (
                                                    <div className="w-8 h-8">
                                                        <CircularProgressbar
                                                            value={calculatePercentage(points)}
                                                            text={`${points}`}
                                                            styles={buildStyles({
                                                                textSize: '32px',
                                                                pathColor: '#6366F1',
                                                                textColor: '#6366F1',
                                                                trailColor: '#E0E7FF',
                                                            })}
                                                        />
                                                    </div>
                                                )}
                                                {/* <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                    status === 'present' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {status === "present" ? "Present" : "Absent"}
                                                </span> */}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Team Comment - Compact */}
                        {userTeam.comment && (
                            <div className="mt-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <MessageCircle className="text-amber-600 dark:text-amber-400 w-4 h-4 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-medium text-amber-800 dark:text-amber-300">Team Feedback:</h4>
                                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{userTeam.comment}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {eventStarted && (
                            <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Event started - team modifications locked
                            </div>
                        )}
                    </div>
                ) : (
                    // Compact Team Creation Options
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4">
                            <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Create Team</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Start your own team and invite others.</p>
                            <button
                                onClick={() => setShowCreateTeamModal(true)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-sm transition-colors"
                            >
                                Create Team
                            </button>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Join Team</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Enter a team code to join existing team.</p>
                            <button
                                onClick={() => setShowJoinTeamModal(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition-colors"
                            >
                                Join Team
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Compact Participating Teams */}
            <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Trophy size={20} className="text-white" />
                        <h2 className="font-semibold text-white">Teams ({allTeams.length})</h2>
                    </div>
                </div>

                <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
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
                                    className={`relative ${isUserTeam ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-gray-50 dark:bg-gray-800/50'} rounded-lg p-3 border ${isUserTeam ? 'border-indigo-200 dark:border-indigo-700' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    {/* Rank and Team Info */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="w-10 h-10">
                                                <CircularProgressbar
                                                    value={calculatePercentage(maxTeamPoints)}
                                                    text={`${maxTeamPoints}`}
                                                    styles={buildStyles({
                                                        textSize: '28px',
                                                        pathColor: '#6366F1',
                                                        textColor: '#6366F1',
                                                        trailColor: '#E0E7FF',
                                                    })}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{team.teamName}</h3>
                                                    {isUserTeam && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Your Team</span>}
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {team.members?.length || 0} members · {calculatePercentage(maxTeamPoints)}%
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {team.comment && (
                                            <button
                                                onClick={(e) => handleCommentClick(team.comment, e)}
                                                className="bg-amber-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                                            >
                                                <MessageCircle size={12} />
                                                Feedback
                                            </button>
                                        )}
                                    </div>

                                    {/* Team Members - Compact Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {Array.isArray(team.members) && team.members.map((member, idx) => {
                                            const memberAttendance = teamAttendance.find(a => a.studentId === (member._id || member));
                                            const isLeader = team.leader._id === (member._id || member);

                                            return (
                                                <div key={idx} className="flex items-center gap-2 bg-white/60 dark:bg-gray-900/50 rounded-md p-2">
                                                    <div className="relative">
                                                        <img
                                                            src={member.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                            alt={member.fullName}
                                                            className="w-6 h-6 rounded-full object-cover"
                                                        />
                                                        {isLeader && (
                                                            <Trophy size={8} className="absolute -top-1 -right-1 text-yellow-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                {member.fullName || 'Unknown'}
                                                            </span>
                                                            {(member.comment || memberAttendance?.comments) && (
                                                                <button
                                                                    onClick={(e) => handleCommentClick(member.comment || memberAttendance.comments, e)}
                                                                    className="text-indigo-500 p-0.5"
                                                                >
                                                                    <FaCommentAlt size={8} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {/* <span className={`text-xs px-1 py-0.5 rounded ${
                                                                memberAttendance?.status === 'present' 
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            }`}>
                                                                {memberAttendance?.status === 'present' ? 'P' : 'A'}
                                                            </span> */}
                                                            {memberAttendance?.pointsGiven > 0 && (
                                                                <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-1 py-0.5 rounded">
                                                                    {memberAttendance.pointsGiven}
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

            {/* Modals remain the same */}
            {/* Create Team Modal */}
            {showCreateTeamModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
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

        {/* Compact CSS Styles */}
        <style jsx>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fadeIn 0.2s ease-in-out;
            }
            .prose {
                font-size: 0.875rem;
            }
            .prose h1, .prose h2, .prose h3, .prose h4 {
                margin-top: 1rem;
                margin-bottom: 0.5rem;
            }
            .prose p {
                margin-top: 0.5rem;
                margin-bottom: 0.5rem;
            }
            .prose ul, .prose ol {
                margin-top: 0.5rem;
                margin-bottom: 0.5rem;
                padding-left: 1.5rem;
            }
            .prose li {
                margin-top: 0.25rem;
                margin-bottom: 0.25rem;
            }
            .prose code {
                background: rgba(99, 102, 241, 0.1);
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
                font-size: 0.8rem;
            }
            .prose pre {
                background: rgba(99, 102, 241, 0.05);
                padding: 0.75rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                font-size: 0.8rem;
                margin: 0.5rem 0;
            }
            .prose blockquote {
                border-left: 4px solid rgb(99, 102, 241);
                padding-left: 1rem;
                margin: 0.5rem 0;
                font-style: italic;
                color: rgb(75, 85, 99);
            }
            .dark .prose blockquote {
                color: rgb(156, 163, 175);
                border-left-color: rgb(139, 92, 246);
            }
            /* Custom scrollbar for teams list */
            .space-y-3::-webkit-scrollbar {
                width: 4px;
            }
            .space-y-3::-webkit-scrollbar-track {
                background: rgba(99, 102, 241, 0.1);
                border-radius: 2px;
            }
            .space-y-3::-webkit-scrollbar-thumb {
                background: rgba(99, 102, 241, 0.3);
                border-radius: 2px;
            }
            .space-y-3::-webkit-scrollbar-thumb:hover {
                background: rgba(99, 102, 241, 0.5);
            }
        `}</style>
    </div>
);
}

export default TeamEventParticipation;