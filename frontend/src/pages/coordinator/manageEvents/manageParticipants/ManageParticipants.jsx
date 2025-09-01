import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { Search } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { backendUrl } from "../../../../utils/routes";
import EventBanner from "./EventBanner";
import AddStudent from "./AddStudent";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const modalStyles = {
    allParticipants: { zIndex: 50 },
    deleteConfirmation: { zIndex: 110 },
    editParticipant: { zIndex: 120 },
    givePointsAll: { zIndex: 130 },
};

const ManageParticipants = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [winners, setWinners] = useState([]);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editedParticipant, setEditedParticipant] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [givePointsModalOpen, setGivePointsModalOpen] = useState(false);
    const [pointsForAll, setPointsForAll] = useState("");
    const [isGivingPoints, setIsGivingPoints] = useState(false);
    const [isAddingParticipant, setIsAddingParticipant] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [participantsPerPage] = useState(10);
    const [maxPoints, setMaxPoints] = useState(100); // Default max points value to calculate percentage
    const navigate = useNavigate();
    const token = localStorage.getItem("jwtToken");
    let decodedToken = null;
    if (token) {
        try {
            decodedToken = jwtDecode(token);
        } catch (error) {
            console.error("Error decoding JWT token:", error.message);
        }
    }

    const fetchTotalPoints = async (studentId) => {
        try {
            if (!token || !decodedToken?.email) {
                setError('No auth token or email found. Please log in.');
                return;
            }

            let sumPoints = 0;
            const response = await fetch(`${backendUrl}/api/v1/club/attendance?studentId=${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            // Check if result.records is an array
            if (Array.isArray(result.records)) {
                // Iterate over the records and sum up pointsgiven
                result.records.forEach(record => {
                    sumPoints += record.pointsGiven || 0;// Default to 0 if pointsgiven is undefined
                });
                updateTotalPoints(sumPoints, studentId);
            } else {
                console.log("No records found or result.records is not an array");
            }
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const updateTotalPoints = async (sumPoints, studentId) => {
        try {
            // Extract the studentId from the decoded JWT token
            // Make a GET request to the backend to fetch the user's profile, passing studentId
            const response = await fetch(`${backendUrl}/user/profile?id=${studentId}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    TotalPoints: sumPoints,
                }),
            });
            const result = await response.json();
            // Check if the request was successful
            if (response.status === 200) {
            }
        } catch (error) {
            console.error('Error fetching total points:', error);  // Also add this line in the catch block
        }
    };

    const calculatePercentage = (points) => {
        const percentage = Math.min(Math.round((points / maxPoints) * 100), 100);
        return percentage;
    };

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!token || !decodedToken?.email) {
                setError('No auth token or email found. Please log in.');
                return;
            }
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                    params: { id },
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.event) {
                    setEvent(response.data.event);
                    // Set max points from event details if available
                    if (response.data.event.maxPoints) {
                        setMaxPoints(response.data.event.maxPoints);
                    }

                    // Check if this is a team event (maxMember > 1)
                    if (response.data.event.maxMember > 1) {
                        console.log("Team event detected, redirecting to team participants page");
                        navigate(`/manage-event/participants/${id}`);
                        return;
                    }

                    console.log("Event fetched successfully:", response.data.event);
                } else {
                    console.error("Event data is empty or undefined");
                }
            } catch (error) {
                console.error("Error fetching event details:", error.response?.data || error.message);
            }
        };

        const getParticipants = async () => {
            try {
                console.log("Fetching participants for eventId:", id);
                const response = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { eventId: id },
                });

                if (response.data.records) {
                    console.log("Participants fetched successfully:", response.data.records.length);
                    setParticipants(response.data.records);
                } else {
                    console.log("No participants found or records is empty");
                    setParticipants([]);
                }
            } catch (error) {
                console.error("Error fetching participants:", error.response?.data || error.message);
                setError("Failed to load participants.");
            }
        };

        const getWinners = async () => {
            try {
                // Fetch event details to get totalWinner count
                const eventResponse = await axios.get(`${backendUrl}/api/v1/club/events`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { id }, // `id` refers to the eventId
                });

                const event = eventResponse.data.event;
                if (!event) {
                    console.error("Event not found.");
                    return;
                }

                const totalWinners = event.totalWinner;

                // Fetch attendance records sorted by pointsGiven in descending order
                const attendanceResponse = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        eventId: id,
                        pointsGreaterThan: 0, // Optional: filter out participants with zero points
                    },
                });

                const attendanceRecords = attendanceResponse.data.records || [];

                // Sort attendance by pointsGiven in descending order and select the top `totalWinner` participants
                const winners = attendanceRecords
                    .sort((a, b) => b.pointsGiven - a.pointsGiven) // Descending order
                    .slice(0, totalWinners);

                setWinners(winners); // Update state with the top winners
            } catch (error) {
                console.error("Error fetching winners:", error.response?.data || error.message);
            }
        };

        // Make sure the token is available before making API calls
        if (token) {
            fetchEventDetails();
            getParticipants();
            getWinners();
        } else {
            console.error("No authentication token available");
        }

        // Remove participants from the dependency array to prevent infinite loops
    }, [id, token, navigate]);

    // Sort participants by points in descending order (highest first)
    const sortedParticipants = [...participants].sort((a, b) =>
        (b.pointsGiven || 0) - (a.pointsGiven || 0)
    );

    // Filter participants based on search term - use sortedParticipants instead of participants
    const filteredParticipants = sortedParticipants.filter(participant =>
        participant.studentId &&
        (participant.studentId.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.studentId.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Calculate pagination for participants in the modal view
    const indexOfLastParticipant = currentPage * participantsPerPage;
    const indexOfFirstParticipant = indexOfLastParticipant - participantsPerPage;
    const currentParticipants = filteredParticipants.slice(indexOfFirstParticipant, indexOfLastParticipant);
    const totalPages = Math.ceil(filteredParticipants.length / participantsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Go to next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Go to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Handler for deleting a participant
    const handleDeleteClick = (participant) => {
        setSelectedParticipant(participant);
        setDeleteModalOpen(true);
    };

    const handleDeleteParticipant = async () => {
        if (selectedParticipant) {
            try {
                const response = await axios.delete(`${backendUrl}/api/v1/club/attendance`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { id: selectedParticipant._id },
                });
                if (response.status === 200) {
                    setParticipants((prev) =>
                        prev.filter((participant) => participant._id !== selectedParticipant._id)
                    );
                    fetchTotalPoints(selectedParticipant.studentId._id);
                }
            } catch (error) {
                console.error("Error deleting participant:", error.response?.data || error.message);
            } finally {
                setDeleteModalOpen(false);
                setSelectedParticipant(null);
            }
        }
    };

    // Handler for modifying a participant
    const handleModifyClick = (participant) => {
        setEditedParticipant({ ...participant, comment: participant.comment || "" });
        setEditModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedParticipant((prev) => ({
            ...prev,
            [name]: name === "points" ? parseInt(value, 10) : value, // Parse points as integer
        }));
    };
    const handleEditParticipant = async () => {
        if (editedParticipant) {
            try {
                const response = await axios.put(`${backendUrl}/api/v1/club/attendance`, {
                    updates: [
                        {
                            id: editedParticipant._id,
                            status: editedParticipant.status,
                            pointsGiven: editedParticipant.points,
                            comment: editedParticipant.comment || "", // Include comment in the update
                            studentId: editedParticipant.studentId._id,
                        },
                    ],
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("comments ", editedParticipant.comment);
                

                if (response.status === 200) {
                    // Update the participant in the state
                    setParticipants((prev) =>
                        prev.map((participant) =>
                            participant._id === editedParticipant._id ? { ...participant, ...editedParticipant } : participant
                        )
                    );
                    fetchTotalPoints(editedParticipant.studentId._id); // Update total points
                    setEditModalOpen(false); // Close the modal
                    setEditedParticipant(null); // Reset the edited participant
                }
            } catch (error) {
                console.error("Error modifying participant:", error.response?.data || error.message);
            }
        }
    };

    // Handler for viewing all participants
    const handleViewAllClick = () => {
        setModalOpen(true);  // Open the modal when the button is clicked
    };

    // Handler for closing the modal
    const handleCloseModal = () => {
        setModalOpen(false);  // Close the modal
    };

    // Handler for marking all as present
    const handleMarkAllPresent = async () => {
        if (isUpdating) return; // Prevent multiple simultaneous updates
        setIsUpdating(true);

        try {
            const updates = participants.map(participant => ({
                id: participant._id,
                status: "present",
                pointsGiven: participant.pointsGiven || 0,
                studentId: participant.studentId._id
            }));

            const response = await axios.put(
                `${backendUrl}/api/v1/club/attendance`,
                { updates },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setParticipants(prevParticipants =>
                    prevParticipants.map(participant => ({
                        ...participant,
                        status: "present"
                    }))
                );
            }
        } catch (error) {
            console.error("Error marking all as present:", error.response?.data || error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handler for marking all as absent
    const handleMarkAllAbsent = async () => {
        if (isUpdating) return; // Prevent multiple simultaneous updates
        setIsUpdating(true);

        try {
            const updates = participants.map(participant => ({
                id: participant._id,
                status: "absent",
                pointsGiven: participant.pointsGiven || 0,
                studentId: participant.studentId._id
            }));

            const response = await axios.put(
                `${backendUrl}/api/v1/club/attendance`,
                { updates },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setParticipants(prevParticipants =>
                    prevParticipants.map(participant => ({
                        ...participant,
                        status: "absent"
                    }))
                );
            }
        } catch (error) {
            console.error("Error marking all as absent:", error.response?.data || error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Highlighted Text component
    const HighlightedText = ({ text, highlight }) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }

        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);

        return (
            <span>
                {parts.map((part, index) =>
                    regex.test(part) ? (
                        <span key={index} className="bg-yellow-200 dark:bg-yellow-600">{part}</span>
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </span>
        );
    };

    // Handler for giving points to all participants
    const handleGivePointsToAll = async () => {
        if (isGivingPoints || !pointsForAll) return;
        setIsGivingPoints(true);

        try {
            const pointsToAdd = parseInt(pointsForAll);
            const updates = participants.map(participant => ({
                id: participant._id,
                status: participant.status,
                pointsGiven: (participant.pointsGiven || 0) + pointsToAdd, // Add new points to existing points
                studentId: participant.studentId._id
            }));

            const response = await axios.put(
                `${backendUrl}/api/v1/club/attendance`,
                { updates },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                const updatedParticipants = participants.map(participant => ({
                    ...participant,
                    pointsGiven: (participant.pointsGiven || 0) + pointsToAdd
                }));

                setParticipants(updatedParticipants);
                updatedParticipants.forEach(participant => fetchTotalPoints(participant.studentId._id));
                setGivePointsModalOpen(false);
                setPointsForAll("");
            }
        } catch (error) {
            console.error("Error giving points to all:", error.response?.data || error.message);
        } finally {
            setIsGivingPoints(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-violet-950">
            <div className="container mx-auto px-4 py-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Event Banner */}
                    <div className="lg:col-span-2 transform hover:scale-[1.01] transition-transform duration-300">
                        <EventBanner props={{ eventId: id }} />
                    </div>

                    {/* Winners Section */}
                    <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-indigo-100/50 dark:border-violet-900/30 transform hover:scale-[1.01] transition-transform duration-300">
                        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="text-2xl">🏆</span> Winners
                            </h2>
                        </div>
                        <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-indigo-100">
                            {winners.length > 0 ? (
                                <div className="space-y-3">
                                    {winners.map((winner, index) => (
                                        <div key={index}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/40 dark:to-violet-900/40 border border-indigo-100 dark:border-violet-800/50 hover:shadow-md transition-all">
                                            <div className="relative">
                                                <img
                                                    src={winner.photo || '/api/placeholder/48/48'}
                                                    alt={winner.name}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400 dark:ring-violet-500"
                                                />
                                                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{winner.name}</h4>
                                                <span className="text-xs bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent font-semibold">
                                                    {winner.pointsGiven || 0} points
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-indigo-500 dark:text-indigo-400">No winners yet</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Participants Management Section */}
                <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 dark:border-violet-900/30">
                    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <span className="text-2xl">👥</span> Manage Participants
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none"
                                onClick={() => setIsAddingParticipant(true)}
                            >
                                ➕ Add Participant
                            </button>
                            <button
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 focus:ring-2 focus:ring-white/50 focus:outline-none"
                                onClick={handleViewAllClick}
                            >
                                👁️ View All
                            </button>
                            <span className="px-4 py-1.5 bg-white/20 text-white rounded-full text-sm font-medium">
                                {participants.length} Registered
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="overflow-hidden rounded-xl shadow-md">
                            {participants.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-indigo-500/90 via-violet-500/90 to-purple-500/90 text-white">
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Participant</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Points</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedParticipants.map((participant, index) => (
                                                <tr key={participant._id}
                                                    className={`${index % 2 === 0 ? 'bg-indigo-50/70 dark:bg-indigo-900/20' : 'bg-violet-50/70 dark:bg-violet-900/20'} 
                                                    hover:bg-gradient-to-r hover:from-indigo-100/80 hover:to-violet-100/80 
                                                    dark:hover:from-indigo-800/30 dark:hover:to-violet-800/30 
                                                    transition-all duration-200 backdrop-blur-sm`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900 dark:text-indigo-300">
                                                        <div className="flex justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover border-2 border-indigo-300 dark:border-violet-500 shadow-inner"
                                                                    src={participant.studentId?.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                                                    {participant.studentId?.fullName}
                                                                </div>
                                                                <div className="text-xs text-indigo-500 dark:text-indigo-400">
                                                                    {participant.studentId?.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                                                            ${participant.status === 'present'
                                                                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                                                                : 'bg-gradient-to-r from-red-400 to-red-500 text-white'}`}>
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30  ${participant.status === 'present' ? 'bg-green-400' : 'bg-red-400'}"></span>
                                                            <span className="relative">
                                                                {participant.status === "present" ? "Present" : "Absent"}
                                                            </span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-16 h-16 relative group">
                                                                <div style={{ width: '100%', height: '100%' }}>
                                                                    <CircularProgressbar
                                                                        value={calculatePercentage(participant.pointsGiven || 0)}
                                                                        text={`${participant.pointsGiven || 0}`}
                                                                        styles={buildStyles({
                                                                            textSize: '28px',
                                                                            pathColor: `rgba(99, 102, 241, ${calculatePercentage(participant.pointsGiven || 0) / 100 + 0.2})`,
                                                                            textColor: '#6366F1',
                                                                            trailColor: '#E0E7FF',
                                                                            backgroundColor: '#8B5CF6',
                                                                            pathTransition: 'stroke-dashoffset 0.5s ease 0s',
                                                                        })}
                                                                    />
                                                                </div>
                                                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                    <span className="font-bold text-indigo-600 dark:text-indigo-300">
                                                                        {calculatePercentage(participant.pointsGiven || 0)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                className="relative p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                                onClick={() => handleModifyClick(participant)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                                <span className="absolute inset-0 rounded-lg overflow-hidden">
                                                                    <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/30 to-violet-500/30 animate-pulse"></span>
                                                                </span>
                                                            </button>
                                                            <button
                                                                className="relative p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                                onClick={() => handleDeleteClick(participant)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                <span className="absolute inset-0 rounded-lg overflow-hidden">
                                                                    <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/30 to-pink-500/30 animate-pulse"></span>
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <svg className="w-16 h-16 text-indigo-300 dark:text-indigo-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-200">No participants yet</h3>
                                    <p className="mt-1 text-sm text-indigo-500 dark:text-indigo-400">Add participants to get started</p>
                                    <button
                                        className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-md hover:from-indigo-600 hover:to-violet-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-indigo-500/50"
                                        onClick={() => setIsAddingParticipant(true)}
                                    >
                                        Add Participants
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Styling Updates */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center" style={modalStyles.editParticipant}>
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 w-1/3 shadow-2xl border border-indigo-100/50 dark:border-violet-900/30">
                        <h2 className="text-lg font-bold mb-4 text-indigo-900 dark:text-indigo-200">Edit Participant</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-indigo-600 dark:text-indigo-400">Status</label>
                                <select
                                    name="status"
                                    value={editedParticipant.status}
                                    onChange={handleInputChange}
                                    className="block text-black w-full p-2 border rounded bg-indigo-50 dark:bg-violet-900 text-indigo-900 dark:text-indigo-200"
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-indigo-600 dark:text-indigo-400">Points</label>
                                <input
                                    type="number"
                                    name="points"
                                    value={editedParticipant.points}
                                    onChange={handleInputChange}
                                    className="block w-full text-black p-2 border rounded bg-indigo-50 dark:bg-violet-900 text-indigo-900 dark:text-indigo-200"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-indigo-600 dark:text-indigo-400">Comment</label>
                                <textarea
                                    name="comment"
                                    value={editedParticipant.comment}
                                    onChange={handleInputChange}
                                    className="block w-full text-black p-2 border rounded bg-indigo-50 dark:bg-violet-900 text-indigo-900 dark:text-indigo-200"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                                    onClick={() => setEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                    onClick={handleEditParticipant}
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    style={modalStyles.deleteConfirmation}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-1/3">
                        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Are you sure you want to delete this participant?</h2>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                onClick={handleDeleteParticipant}
                            >
                                Yes
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Give Points to All Modal */}
            {
                isAddingParticipant && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-2/3 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Add Participants</h2>
                                <button
                                    className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                                    onClick={() => setIsAddingParticipant(false)}
                                >
                                    Close
                                </button>
                            </div>
                            <AddStudent
                                eventId={id}
                                participants={participants}
                                setParticipants={setParticipants}
                                onClose={() => {
                                    setIsAddingParticipant(false);
                                }}
                            />
                        </div>
                    </div>
                )
            }
            {givePointsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" style={modalStyles.givePointsAll}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-1/3">
                        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Give Points to All Participants</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Points</label>
                            <input
                                type="number"
                                value={pointsForAll}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Updated regex to allow negative integers
                                    if (value === "" || /^-?\d*$/.test(value)) {
                                        setPointsForAll(value);
                                    }
                                }}
                                className="block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700
                     text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter points (positive or negative)"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                                onClick={() => {
                                    setGivePointsModalOpen(false);
                                    setPointsForAll("");
                                }}
                                disabled={isGivingPoints}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                onClick={handleGivePointsToAll}
                                disabled={isGivingPoints || !pointsForAll}
                            >
                                {isGivingPoints ? 'Giving Points...' : 'Give Points'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for viewing all participants */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center" style={modalStyles.allParticipants}>
                    <div
                        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-indigo-100/50 dark:border-violet-900/30"
                        style={{
                            width: 'calc(100% - 50px)',
                            height: 'calc(100% - 50px)',
                            margin: '25px',
                        }}
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">All Participants</h2>
                                <button
                                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    onClick={handleCloseModal}
                                    aria-label="Close"
                                >
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div className="relative w-1/3">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1); // Reset to first page on search
                                        }}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white/50 dark:bg-gray-700/50
                                    text-gray-800 dark:text-gray-200 border-indigo-200 dark:border-indigo-600
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-violet-700 transition-colors shadow-md"
                                        onClick={() => setGivePointsModalOpen(true)}
                                    >
                                        💯 Give Points to All
                                    </button>

                                    <button
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors shadow-md disabled:opacity-50"
                                        onClick={handleMarkAllPresent}
                                        disabled={isUpdating}
                                    >
                                        ✓ {isUpdating ? 'Updating...' : 'Mark All Present'}
                                    </button>

                                    <button
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-rose-700 transition-colors shadow-md disabled:opacity-50"
                                        onClick={handleMarkAllAbsent}
                                        disabled={isUpdating}
                                    >
                                        ✗ {isUpdating ? 'Updating...' : 'Mark All Absent'}
                                    </button>
                                </div>
                            </div>

                            {/* Table container with flex-grow to fill available space */}
                            <div className="flex-grow overflow-hidden rounded-xl bg-white/70 dark:bg-gray-800/70 shadow-lg border border-indigo-100/50 dark:border-violet-900/30 flex flex-col">
                                <div className="flex-grow overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-indigo-500/90 via-violet-500/90 to-purple-500/90 text-white sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Participant</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Points</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-100 dark:divide-indigo-900/30">
                                            {currentParticipants.map((participant, index) => (
                                                <tr key={participant._id}
                                                    className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                                                            {indexOfFirstParticipant + index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={participant.studentId.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                                alt={participant.studentId.fullName}
                                                                className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-400 shadow-sm"
                                                            />
                                                            <div>
                                                                <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                                                    {participant.studentId.fullName}
                                                                </div>
                                                                <div className="text-xs text-indigo-500 dark:text-indigo-400">
                                                                    <HighlightedText
                                                                        text={participant.studentId.email}
                                                                        highlight={searchTerm}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        ${participant.status === 'present'
                                                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                                                                : 'bg-gradient-to-r from-red-400 to-rose-500 text-white'}`}>
                                                            {participant.status === "present" ? "Present" : "Absent"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-12 h-12 relative group">
                                                                <CircularProgressbar
                                                                    value={calculatePercentage(participant.pointsGiven || 0)}
                                                                    text={`${participant.pointsGiven || 0}`}
                                                                    styles={buildStyles({
                                                                        textSize: '30px',
                                                                        pathColor: `rgba(99, 102, 241, ${calculatePercentage(participant.pointsGiven || 0) / 100 + 0.2})`,
                                                                        textColor: '#6366F1',
                                                                        trailColor: '#E0E7FF',
                                                                        backgroundColor: '#8B5CF6',
                                                                    })}
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                    <span className="font-bold text-indigo-600 dark:text-indigo-300">
                                                                        {calculatePercentage(participant.pointsGiven || 0)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="p-1.5 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-400 rounded"
                                                                onClick={() => handleModifyClick(participant)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400 rounded"
                                                                onClick={() => handleDeleteClick(participant)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {filteredParticipants.length === 0 && (
                                        <div className="flex items-center justify-center h-64">
                                            <div className="text-center">
                                                <svg className="w-16 h-16 mx-auto text-indigo-300 dark:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <h3 className="mt-2 text-lg font-medium text-indigo-900 dark:text-indigo-200">No results found</h3>
                                                <p className="mt-1 text-sm text-indigo-500 dark:text-indigo-400">Try adjusting your search criteria</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {filteredParticipants.length > 0 && (
                                    <div className="px-6 py-4 bg-indigo-50/50 dark:bg-indigo-900/20 border-t border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                                        <div className="text-sm text-indigo-500 dark:text-indigo-400">
                                            Showing <span className="font-medium">{indexOfFirstParticipant + 1}</span> to{" "}
                                            <span className="font-medium">
                                                {indexOfLastParticipant > filteredParticipants.length
                                                    ? filteredParticipants.length
                                                    : indexOfLastParticipant}
                                            </span>{" "}
                                            of <span className="font-medium">{filteredParticipants.length}</span> participants
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <button
                                                onClick={prevPage}
                                                disabled={currentPage === 1}
                                                className={`p-2 rounded-lg ${currentPage === 1
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-400 dark:text-indigo-600 cursor-not-allowed'
                                                    : 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-300 dark:hover:bg-indigo-700'}`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>

                                            <div className="flex gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                    .filter(num => {
                                                        // Show first page, last page and pages around current page
                                                        return num === 1 || num === totalPages ||
                                                            (num >= currentPage - 1 && num <= currentPage + 1);
                                                    })
                                                    .reduce((acc, num, idx, array) => {
                                                        // Add the page number
                                                        acc.push(
                                                            <button
                                                                key={num}
                                                                onClick={() => paginate(num)}
                                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium
                                                                    ${currentPage === num
                                                                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
                                                                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'}`}
                                                            >
                                                                {num}
                                                            </button>
                                                        );

                                                        // Add ellipsis if needed
                                                        if (idx < array.length - 1 && array[idx + 1] - num > 1) {
                                                            acc.push(
                                                                <span key={`ellipsis-${num}`} className="px-2 text-indigo-500 dark:text-indigo-400">
                                                                    ...
                                                                </span>
                                                            );
                                                        }

                                                        return acc;
                                                    }, [])
                                                }
                                            </div>

                                            <button
                                                onClick={nextPage}
                                                disabled={currentPage === totalPages}
                                                className={`p-2 rounded-lg ${currentPage === totalPages
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-400 dark:text-indigo-600 cursor-not-allowed'
                                                    : 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-300 dark:hover:bg-indigo-700'}`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageParticipants;
