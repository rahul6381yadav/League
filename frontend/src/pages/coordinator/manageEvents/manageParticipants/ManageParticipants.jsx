import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { Search } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { backendUrl } from "../../../../utils/routes";
import EventBanner from "./EventBanner";
// Token decoding logic remains the same
const token = localStorage.getItem("jwtToken");
let decodedToken = null;
if (token) {
    try {
        decodedToken = jwtDecode(token);
    } catch (error) {
        console.error("Error decoding JWT token:", error.message);
    }
}

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
    const navigate = useNavigate();


    const fetchTotalPoints = async (studentId) => {
        try {
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
    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/events`, {
                    params: { id },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvent(response.data.event);
            } catch (error) {
                console.error("Error fetching event details:", error.response?.data || error.message);
            }
        };

        const getParticipants = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { eventId: id },
                });
                setParticipants(response.data.records || []);
                // console.log(response.data.records);
                // Using map to generate an array of promises
                // const promises = response.data.records.map((record) => {
                //     return fetchTotalPoints(record.studentId._id); // Assuming fetchTotalPoints is an async function
                // });

                // // Wait for all promises to resolve
                // await Promise.all(promises);

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


        fetchEventDetails();
        getParticipants();
        getWinners();
    }, [id, token,participants]);

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
        setEditedParticipant({ ...participant });
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
                            studentId: editedParticipant.studentId._id
                        },
                    ],
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 200) {
                    fetchTotalPoints(editedParticipant.studentId._id);
                    setParticipants((prev) =>
                        prev.map((participant) =>
                            participant._id === editedParticipant._id ? editedParticipant : participant
                        )
                    );
                }
            } catch (error) {
                console.error("Error modifying participant:", error.response?.data || error.message);
            } finally {
                setEditModalOpen(false);
                setEditedParticipant(null);
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

    // Filter participants based on search term
    const filteredParticipants = participants.filter(participant =>
        participant.studentId.fullName.toLowerCase().includes(searchTerm.toLowerCase())||
        participant.studentId.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <div className="h-screen w-full flex flex-col bg-mirage-50 dark:bg-mirage-900">
            <div className="flex-1 flex flex-col p-8 pb-20 md:pb-8 gap-8">
                <div className="flex flex-col md:flex-row gap-8 flex-1">
                    <EventBanner props={{ eventId: id }} />
                    <div className="flex flex-col bg-white dark:bg-mirage-800 rounded-lg shadow-md w-full md:w-1/3 flex-1">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-mirage-700 dark:text-mirage-300">Winners</h2>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            {winners.length > 0 ? (
                                <div className="space-y-4">
                                    {winners.map((winner, index) => (
                                        <div key={index}
                                            className="flex items-center space-x-3 p-3 rounded-lg bg-white dark:bg-mirage-700">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={winner.photo || '/api/placeholder/48/48'}
                                                    alt={winner.name}
                                                    className="w-12 h-12 rounded-full border border-mirage-300 dark:border-mirage-500"
                                                />
                                                <div>
                                                    <h4 className="text-sm font-medium text-mirage-600 dark:text-mirage-200">{winner.name}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-mirage-500 dark:text-mirage-400 text-center flex-1 flex items-center justify-center">No winners yet</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-mirage-800 rounded-lg shadow-md flex flex-col">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-mirage-700 dark:text-mirage-300">Manage Participants</h2>
                            <span className="flex items-center gap-2">
                                <span className="bg-mirage-100 dark:bg-mirage-600 text-mirage-800 dark:text-mirage-300 text-sm font-medium px-3 py-1 rounded-full">
                                    {participants.length} Registered
                                </span>
                                <button className="bg-mirage-100 dark:bg-mirage-600 text-mirage-800 dark:text-mirage-300 text-sm font-medium px-4 py-2 rounded-lg" onClick={handleViewAllClick}>
                                    View All
                                </button>
                            </span>
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        {Array.isArray(participants) && participants.length > 0 ? (
                            <div className="overflow-x-auto bg-white dark:bg-mirage-700 rounded-lg shadow-md flex-1">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-mirage-100 dark:bg-mirage-600">
                                            <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">#</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Photo</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Participant Name</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Email</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Status</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Points</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participants.map((participant, index) => (
                                            <tr key={participant._id}
                                                className="border-t border-b border-mirage-200 dark:border-mirage-500">
                                                <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                    <img
                                                        src={participant.studentId && participant.studentId.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                        alt={participant.studentId && participant.studentId.fullName}
                                                        className="w-12 h-12 rounded-full border border-mirage-300 dark:border-mirage-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                    {participant.studentId && participant.studentId.fullName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                    {participant.studentId && participant.studentId.email}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                    {participant.status === "present" ? "Present" : "Absent"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                    {participant.pointsGiven || 0}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                    <button
                                                        className="bg-blue-500 text-white px-2 py-1 rounded-lg mr-2"
                                                        onClick={() => handleModifyClick(participant)}
                                                    >
                                                        Modify
                                                    </button>

                                                    <button
                                                        className="bg-red-500 text-white px-2 py-1 rounded-lg"
                                                        onClick={() => handleDeleteClick(participant)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        ) : (
                            <div className="text-mirage-500 dark:text-mirage-400 text-center flex-1 flex items-center justify-center">No participants yet</div>
                        )}
                    </div>
                </div>
            </div>


            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center " style={modalStyles.editParticipant}>
                    <div className="bg-white dark:bg-mirage-800 rounded-lg p-6 w-1/3">
                        <h2 className="text-lg font-bold mb-4">Edit Participant</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    name="status"
                                    value={editedParticipant.status}
                                    onChange={handleInputChange}
                                    className="block text-black w-full p-2 border rounded"
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Points</label>
                                <input
                                    type="number"
                                    name="points"
                                    value={editedParticipant.points}
                                    onChange={handleInputChange}
                                    className="block w-full text-black p-2 border rounded"
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
                    <div className="bg-white dark:bg-mirage-800 rounded-lg p-6 w-1/3">
                        <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this participant?</h2>
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

            {givePointsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" style={modalStyles.givePointsAll}>
                    <div className="bg-white dark:bg-mirage-800 rounded-lg p-6 w-1/3">
                        <h2 className="text-lg font-bold mb-4 text-mirage-700 dark:text-mirage-300">Give Points to All Participants</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-mirage-600 dark:text-mirage-200">Points</label>
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
                                className="block w-full p-2 border rounded bg-white dark:bg-mirage-700
                     text-mirage-800 dark:text-mirage-200 border-mirage-200 dark:border-mirage-600
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" style={modalStyles.allParticipants}>
                    <div
                        className="bg-white dark:bg-mirage-800 rounded-lg p-6"
                        style={{
                            width: 'calc(100% - 50px)',
                            height: 'calc(100% - 50px)',
                            margin: '25px',
                        }}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-mirage-700 dark:text-mirage-300">All Participants</h2>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="relative w-1/3">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-mirage-700
                                     text-mirage-800 dark:text-mirage-200 border-mirage-200 dark:border-mirage-600
                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        className="bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                                        onClick={() => setGivePointsModalOpen(true)}
                                    >
                                        Give Points to All
                                    </button>

                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                                        onClick={handleMarkAllPresent}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Updating...' : 'Mark All as Present'}
                                    </button>
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                                        onClick={handleMarkAllAbsent}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Updating...' : 'Mark All as Absent'}
                                    </button>
                                    <button
                                        className="bg-mirage-100 dark:bg-mirage-600 text-mirage-800 dark:text-mirage-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-mirage-200 dark:hover:bg-mirage-500"
                                        onClick={handleCloseModal}
                                        disabled={isUpdating}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* Scrollable table container */}
                        <div
                            className="mt-4 overflow-y-auto"
                            style={{
                                maxHeight: 'calc(100% - 80px)', // Adjust height to ensure it fits within the modal
                            }}
                        >
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-mirage-100 dark:bg-mirage-600">
                                        <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">#</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Photo</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Participant Name</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Email</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Status</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Points</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-mirage-600 dark:text-mirage-200">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredParticipants.map((participant, index) => (
                                        <tr key={participant._id} className="border-t border-b border-mirage-200 dark:border-mirage-500">
                                            <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                <img
                                                    src={participant.studentId.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                    alt={participant.studentId.fullName}
                                                    className="w-12 h-12 rounded-full border border-mirage-300 dark:border-mirage-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                {participant.studentId.fullName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                <HighlightedText
                                                    text={participant.studentId.email}
                                                    highlight={searchTerm}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                {participant.status === "present" ? "Present" : "Absent"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                {participant.pointsGiven || 0}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                <button
                                                    className="bg-blue-500 text-white px-2 py-1 rounded-lg mr-2"
                                                    onClick={() => handleModifyClick(participant)}
                                                >
                                                    Modify
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-2 py-1 rounded-lg"
                                                    onClick={() => handleDeleteClick(participant)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ManageParticipants;
