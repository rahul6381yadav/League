import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { backendUrl } from '../../../utils/routes';
import { FiUsers, FiTrash2, FiCheckSquare } from 'react-icons/fi';

const EventParticipants = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [teams, setTeams] = useState([]);
    const [isCoordinator, setIsCoordinator] = useState(true); // Default to true for coordinators
    const token = localStorage.getItem('jwtToken');

    // Function to check if an event is a team event
    const isTeamEvent = (event) => {
        return event && event.maxMember > 1;
    };

    // Check if the current user is a coordinator for this event
    useEffect(() => {
        const checkCoordinatorPermissions = async () => {
            if (!token) return;

            try {
                // Set isCoordinator to true by default - don't redirect based on role
                setIsCoordinator(true);

                // We can add additional validation here if needed in the future
                // But we should NOT redirect when loading this page

                const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                    params: { id: eventId },
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.event) {
                    // Just validate the event exists
                    console.log("Event data retrieved successfully");
                }
            } catch (error) {
                console.error("Error checking permissions:", error);
            }
        };

        checkCoordinatorPermissions();
    }, [eventId, token]);

    // Fetch event details and teams
    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                    params: { id: eventId },
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.event) {
                    setEvent(response.data.event);

                    // If it's not a team event, redirect to standard attendance
                    // Only redirect if it's definitely not a team event
                    if (response.data.event.maxMember !== undefined &&
                        response.data.event.maxMember <= 1) {
                        navigate(`/manage-event/${eventId}/attendance`);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };

        const fetchTeams = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                    params: { eventId },
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.teams) {
                    setTeams(response.data.teams);
                }
            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };

        fetchEventDetails();
        fetchTeams();
    }, [eventId, token, navigate]);

    const handleTeamDeletion = async (teamId) => {
        if (window.confirm("Are you sure you want to delete this team? This will remove all team members and their attendance records.")) {
            try {
                await axios.delete(`${backendUrl}/api/v1/eventTeam/${teamId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Refresh team list
                const fetchTeams = async () => {
                    try {
                        const response = await axios.get(`${backendUrl}/api/v1/eventTeam/getTeam`, {
                            params: { eventId },
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (response.data && response.data.teams) {
                            setTeams(response.data.teams);
                        }
                    } catch (error) {
                        console.error("Error fetching teams:", error);
                    }
                };

                fetchTeams();
                alert("Team deleted successfully");
            } catch (error) {
                alert(error.response?.data?.message || "Failed to delete team");
            }
        }
    };

    // Redesigned render method with card style UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-violet-950">
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Event Header Card */}
                {event && (
                    <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30">
                        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white">{event.eventName}</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{event.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <span className="mr-2">📅</span>
                                    {new Date(event.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <span className="mr-2">🕒</span>
                                    {new Date(event.date).toLocaleTimeString()}
                                </div>
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <span className="mr-2">📍</span>
                                    {event.venue}
                                </div>
                            </div>
                            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mt-4">
                                <p>This is a team event. Teams can have up to {event.maxMember} members.</p>
                                <p className="mt-2 text-sm">
                                    <span className="font-bold">Note:</span> As a coordinator, you have full permissions to manage all teams.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <div key={team._id} className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 flex justify-between items-center">
                                <h3 className="font-medium text-white truncate">{team.teamName}</h3>
                                <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs">
                                    {team.members?.length || 0} / {event?.maxMember}
                                </span>
                            </div>

                            <div className="p-4">
                                <div className="mb-3 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 mr-3">
                                        👑
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium dark:text-gray-200">{team.leader?.fullName || "Unknown"}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Team Leader</p>
                                    </div>
                                </div>

                                {team.members && team.members.length > 0 && (
                                    <div className="flex -space-x-2 overflow-hidden mb-4">
                                        {team.members.slice(0, 5).map((member, idx) => (
                                            <div
                                                key={idx}
                                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                                                style={{
                                                    backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 60%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '10px'
                                                }}
                                            >
                                                {member.fullName ? member.fullName.charAt(0).toUpperCase() : "?"}
                                            </div>
                                        ))}
                                        {team.members.length > 5 && (
                                            <div
                                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-800 dark:text-gray-300"
                                            >
                                                +{team.members.length - 5}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2 mt-4">
                                    <Link
                                        to={`/manage-event/${eventId}/team/${team._id}/attendance`}
                                        className="flex-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm transition-colors"
                                    >
                                        <FiCheckSquare className="mr-2" />
                                        Mark Attendance
                                    </Link>
                                    <button
                                        onClick={() => handleTeamDeletion(team._id)}
                                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center text-sm transition-colors"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty state when no teams */}
                    {teams.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30">
                            <FiUsers className="w-16 h-16 text-indigo-300 dark:text-indigo-600 mb-4" />
                            <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-200">No teams have been formed yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Teams will appear here once students join this event</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventParticipants;