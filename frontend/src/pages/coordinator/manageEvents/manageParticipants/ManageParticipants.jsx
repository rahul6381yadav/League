import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {FaCalendarAlt, FaClock, FaMapMarkerAlt} from "react-icons/fa";
import {jwtDecode} from "jwt-decode";

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

const ManageParticipants = () => {
    const {id} = useParams();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [winners, setWinners] = useState([]);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);  // State for modal visibility
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State for delete confirmation modal
    const [selectedParticipant, setSelectedParticipant] = useState(null); // State for the participant to delete
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editedParticipant, setEditedParticipant] = useState(null);


    // API calls remain the same
    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/v1/club/events`, {
                    params: {id},
                    headers: {Authorization: `Bearer ${token}`},
                });
                setEvent(response.data.event);
            } catch (error) {
                console.error("Error fetching event details:", error.response?.data || error.message);
            }
        };

        const getParticipants = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/v1/club/attendance`, {
                    headers: {Authorization: `Bearer ${token}`},
                    params: {eventId: id},
                });
                setParticipants(response.data.records || []);
            } catch (error) {
                console.error("Error fetching participants:", error.response?.data || error.message);
                setError("Failed to load participants.");
            }
        };

        const getWinners = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/v1/club/winners`, {
                    headers: {Authorization: `Bearer ${token}`},
                    params: {eventId: id},
                });
                setWinners(response.data.winners || []);
            } catch (error) {
                console.error("Error fetching winners:", error.response?.data || error.message);
            }
        };

        fetchEventDetails();
        getParticipants();
        getWinners();
    }, [id, token]);

    const handleDeleteClick = (participant) => {
        setSelectedParticipant(participant);
        setDeleteModalOpen(true);
    };

    const handleDeleteParticipant = async () => {
        if (selectedParticipant) {
            try {
                const response = await axios.delete(`http://localhost:4000/api/v1/club/attendance`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { id: selectedParticipant._id },
                });
                if (response.status === 200) {
                    setParticipants((prev) =>
                        prev.filter((participant) => participant._id !== selectedParticipant._id)
                    );
                }
            } catch (error) {
                console.error("Error deleting participant:", error.response?.data || error.message);
            } finally {
                setDeleteModalOpen(false);
                setSelectedParticipant(null);
            }
        }
    };

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
                const response = await axios.put(`http://localhost:4000/api/v1/club/attendance`, {
                    updates: [
                        {
                            id: editedParticipant._id,
                            status: editedParticipant.status,
                            pointsGiven: editedParticipant.points,
                        },
                    ],
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 200) {
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

    const handleViewAllClick = () => {
        setModalOpen(true);  // Open the modal when the button is clicked
    };

    const handleCloseModal = () => {
        setModalOpen(false);  // Close the modal
    };

    return (
        <div className="h-screen w-full flex flex-col bg-mirage-50 dark:bg-mirage-900">
            <div className="h-full w-full flex flex-col p-8 pb-20 md:pb-8 gap-8">
                {/* Top row with Event Details and Winners cards */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Event Details Card */}
                    <div className="flex flex-col bg-white dark:bg-mirage-800 rounded-lg shadow-md flex-1">
                        <div className="relative w-full rounded-t-lg" style={{paddingBottom: '42.8571%'}}>
                            <div
                                className="absolute top-0 left-0 w-full h-full bg-mirage-200 dark:bg-mirage-600 flex items-center justify-center rounded-t-lg">
                                <span className="text-mirage-600 dark:text-mirage-300">Banner Placeholder</span>
                            </div>
                        </div>
                        <div className="p-6">
                            {event ? (
                                <>
                                    <h1 className="text-3xl font-bold text-mirage-600 dark:text-mirage-100 mb-4">{event.eventName}</h1>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div
                                                className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                                                <FaCalendarAlt className="mr-2 text-mirage-500"/>
                                                <span className="mr-2">Date:</span>
                                                {new Date(event.date).toLocaleDateString()}
                                            </div>
                                            <div
                                                className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                                                <FaMapMarkerAlt className="mr-2 text-mirage-500"/>
                                                <span className="mr-2">Venue:</span>
                                                {event.venue}
                                            </div>
                                            <div
                                                className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                                                <FaClock className="mr-2 text-mirage-500"/>
                                                <span className="mr-2">Duration:</span>
                                                {event.duration}
                                            </div>
                                        </div>
                                        <p className="text-mirage-700 dark:text-mirage-200 text-lg">{event.description}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-mirage-200 dark:bg-mirage-600 rounded w-1/3 mb-4"></div>
                                    <div className="h-4 bg-mirage-200 dark:bg-mirage-600 rounded w-full mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-mirage-200 dark:bg-mirage-600 rounded w-2/3"></div>
                                        <div className="h-4 bg-mirage-200 dark:bg-mirage-600 rounded w-2/3"></div>
                                        <div className="h-4 bg-mirage-200 dark:bg-mirage-600 rounded w-2/3"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Winners Card */}
                    <div className="flex flex-col bg-white dark:bg-mirage-800 rounded-lg shadow-md w-full md:w-1/3">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-mirage-700 dark:text-mirage-300">Winners</h2>
                        </div>
                        <div className="p-6">
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
                                <div className="text-mirage-500 dark:text-mirage-400 text-center">No winners yet</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom row with Participants card */}
                <div className="flex-1 bg-white dark:bg-mirage-800 rounded-lg shadow-md">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-mirage-700 dark:text-mirage-300">Manage
                                Participants</h2>
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
                    <div className="p-6">
                        {Array.isArray(participants) && participants.length > 0 ? (
                            <div className="overflow-x-auto bg-white dark:bg-mirage-700 rounded-lg shadow-md">
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
                                                    src={participant.studentId.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                    alt={participant.studentId.fullName}
                                                    className="w-12 h-12 rounded-full border border-mirage-300 dark:border-mirage-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                {participant.studentId.fullName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                                {participant.studentId.email}
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
                            <div className="text-mirage-500 dark:text-mirage-400 text-center">No participants yet</div>
                        )}
                    </div>
                </div>
            </div>

            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-mirage-800 rounded-lg p-6 w-1/3">
                        <h2 className="text-lg font-bold mb-4">Edit Participant</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    name="status"
                                    value={editedParticipant.status}
                                    onChange={handleInputChange}
                                    className="block w-full p-2 border rounded"
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
                                    className="block w-full p-2 border rounded"
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
                     style={{
                         zIndex: 110,
                     }}>
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

            {/* Modal for viewing all participants */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" style={{
                    zIndex: 100,

                }}>
                    <div
                        className="bg-white dark:bg-mirage-800 rounded-lg p-6"
                        style={{
                            width: 'calc(100% - 50px)',
                            height: 'calc(100% - 50px)',
                            margin: '25px',
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-mirage-700 dark:text-mirage-300">All Participants</h2>
                            <button
                                className="bg-mirage-100 dark:bg-mirage-600 text-mirage-800 dark:text-mirage-300 text-sm font-medium px-4 py-2 rounded-lg"
                                onClick={handleCloseModal}>
                                Close
                            </button>
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
                                {participants.map((participant, index) => (
                                    <tr key={participant._id} className="border-t border-b border-mirage-200 dark:border-mirage-500">
                                        <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                            <img
                                                src={participant.studentId.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                alt={participant.studentId.fullName}
                                                className="w-12 h-12 rounded-full border border-mirage-300 dark:border-mirage-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">{participant.studentId.fullName}</td>
                                        <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">{participant.studentId.email}</td>
                                        <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">{participant.status === "present" ? "Present" : "Absent"}</td>
                                        <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">{participant.points || 0}</td>
                                        <td className="px-4 py-3 text-sm text-mirage-600 dark:text-mirage-200">
                                            <button
                                                className="bg-blue-500 text-white px-2 py-1 rounded-lg mr-2"
                                                onClick={() => handleModifyClick(participant)}
                                            >
                                                Modify
                                            </button>

                                            <button className="bg-red-500 text-white px-2 py-1 rounded-lg" onClick={() => handleDeleteClick(participant)}>Delete</button>
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
