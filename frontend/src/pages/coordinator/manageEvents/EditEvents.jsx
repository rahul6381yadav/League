import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTrophy, FaInfoCircle } from 'react-icons/fa';
import { Mail } from 'lucide-react';
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
// decode jwt token
import { jwtDecode } from "jwt-decode";
import { backendUrl } from '../../../utils/routes';

// Ensure token exists before attempting to decode it
const token = localStorage.getItem("jwtToken");
let decodedToken = null;
if (token) {
    try {
        decodedToken = jwtDecode(token); // Decode JWT token
        console.log("Decoded JWT token:", decodedToken);
    } catch (error) {
        console.error("Error decoding JWT token:", error.message);
    }
}

function EditEvents() {
    const [collateralClubs, setCollateralClubs] = useState([]);
    const [selectedCollateralClubs, setSelectedCollateralClubs] = useState([]);
    const token = localStorage.getItem("jwtToken");
    const { id } = useParams();
    const [eventData, setEventData] = useState({
        eventName: '',
        clubIds: [],
        photo: '',
        description: '',
        venue: '',
        duration: '',
        maxPoints: '',
        endDate: '',
        date: '',
    });
    const location = useLocation();
    const navigate = useNavigate();
    const { clubId: primaryClubId, clubName: primaryClubName } = decodedToken || {};
    const handleBack = () => {
        navigate('/manage-events');
    };
    const handleFormFetch = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/v1/club/events?id=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
            const result = await response.json();
            setEventData(result.event);
            setCollateralClubs(result.event.clubIds);
            console.log("result ", result);
        }
        catch (error) {
            console.log("error ", error);
        }
    };
    useEffect(() => {
        handleFormFetch();
    }, []);


    const handleInputChange = (e) => {
        setEventData({ ...eventData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (clubId) => {
        setSelectedCollateralClubs((prev) => {
            if (prev.includes(clubId)) {
                return prev.filter((id) => id !== clubId);
            }
            return [...prev, clubId];
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const clubIds = [...selectedCollateralClubs];
        const newEvent = { ...eventData, clubIds };
        console.log("club Events ", clubIds);
        console.log("new Events  ", newEvent);
        try {
            const response = await fetch(`${backendUrl}/api/v1/club/events?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newEvent),
            });

            const data = await response.json();
            if (data.isError) {
                alert('Error creating event: ' + data.message);
            } else {
                alert('Event updated successfully!');
            }
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    return (
        <div className="h-screen w-full flex bg-mirage-50 dark:bg-mirage-900">
            <div className="h-full w-full grid grid-cols-1 md:grid-cols-[1fr,auto] gap-8 p-8 pb-20 md:pb-8">
                {/* Left Side - Event Creation and Collaborating Clubs */}
                <div className="flex flex-col space-y-8">
                    {/* Event Creation Form */}
                    <div className="bg-white dark:bg-mirage-800 rounded-lg shadow-md">
                        {/* Banner Section */}
                        <div className="relative w-full rounded-t-lg" style={{ paddingBottom: '25%' }}>
                            <div className="absolute top-0 left-0 w-full h-full bg-mirage-200 dark:bg-mirage-600 flex items-center justify-center rounded-t-lg">
                                <span className="text-mirage-600 dark:text-mirage-300">Event Banner Upload (Coming Soon)</span>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleFormSubmit} className="p-6">
                            <h1 className="text-3xl font-bold text-mirage-600 dark:text-mirage-100 mb-6">Edit Event</h1>

                            <div className="space-y-4 mb-6">
                                {/* Event Name */}
                                <div>
                                    <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">Event Name</label>
                                    <input
                                        type="text"
                                        name="eventName"
                                        value={eventData.eventName}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-lg border border-mirage-200 dark:border-mirage-600 bg-white dark:bg-mirage-700 text-mirage-600 dark:text-mirage-200"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={eventData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full p-3 rounded-lg border border-mirage-200 dark:border-mirage-600 bg-white dark:bg-mirage-700 text-mirage-600 dark:text-mirage-200"
                                        required
                                    />
                                </div>

                                {/* banner of events */}
                                <div>
                                    <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">Banner Link</label>
                                    <input
                                        type="text"
                                        name="photo"
                                        value={eventData.photo}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-lg border border-mirage-200 dark:border-mirage-600 bg-white dark:bg-mirage-700 text-mirage-600 dark:text-mirage-200"
                                    />
                                </div>

                                {/* Event Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                                            <FaCalendarAlt className="inline mr-2" />
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={eventData.date}
                                            onChange={handleInputChange}
                                            className="w-full p-3 rounded-lg border border-mirage-200 dark:border-mirage-600 bg-white dark:bg-mirage-700 text-mirage-600 dark:text-mirage-200"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                                            <FaCalendarAlt className="inline mr-2" />
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={eventData.endDate}
                                            onChange={handleInputChange}
                                            className="w-full p-3 rounded-lg border border-mirage-200 dark:border-mirage-600 bg-white dark:bg-mirage-700 text-mirage-600 dark:text-mirage-200"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                                            <FaClock className="inline mr-2" />
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={eventData.duration}
                                            onChange={handleInputChange}
                                            className="w-full p-3 rounded-lg border border-mirage-200 dark:border-mirage-600 bg-white dark:bg-mirage-700 text-mirage-600 dark:text-mirage-200"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                                            <FaMapMarkerAlt className="inline mr-2" />
                                            Venue
                                        </label>
                                        <input
                                            type="text"
                                            name="venue"
                                            value={eventData.venue}
                                            onChange={handleInputChange}
                                            className="w-full p-3 rounded-lg border border-mirage-200 dark:border-mirage-600 bg-white dark:bg-mirage-700 text-mirage-600 dark:text-mirage-200"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                                            <FaTrophy className="inline mr-2" />
                                            Maximum Points
                                        </label>
                                        <input
                                            type="number"
                                            name="maxPoints"
                                            value={eventData.maxPoints}
                                            onChange={handleInputChange}
                                            className="w-full p-3 rounded-lg border border-mirage-200 dark:border-mirage-600 bg-white dark:bg-mirage-700 text-mirage-600 dark:text-mirage-200"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-mirage-600 dark:bg-mirage-400 text-white rounded-lg py-3 transition-colors hover:bg-mirage-700 dark:hover:bg-mirage-300"
                            >
                                Edit Event
                            </button>
                        </form>
                    </div>

                    {/* Collaborating Clubs Section */}
                    <div className="bg-white dark:bg-mirage-800 rounded-lg shadow-md">
                        <div className="p-6 border-b border-mirage-200 dark:border-mirage-700">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-mirage-700 dark:text-mirage-300">Collaborating Clubs</h2>
                                <span className="bg-mirage-100 dark:bg-mirage-600 text-mirage-800 dark:text-mirage-300 text-sm font-medium px-3 py-1 rounded-full">
                                    {selectedCollateralClubs.length} Selected
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Primary Club Card */}

                                {/* Collateral Club Cards */}
                                {/* Collateral Club Cards */}
                                {collateralClubs.map((club) => (
                                    <div
                                        key={club._id}
                                        className={`group bg-white dark:bg-mirage-700 rounded-lg p-4 border-2 transition-all duration-200 
                                            hover:shadow-lg hover:scale-[1.02] cursor-pointer
                                            ${selectedCollateralClubs.includes(club._id)
                                                ? 'border-mirage-500 dark:border-mirage-400 hover:border-mirage-600 dark:hover:border-mirage-300'
                                                : 'border-transparent hover:border-mirage-300 dark:hover:border-mirage-500'
                                            }`}
                                        onClick={() => handleCheckboxChange(club._id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-full bg-mirage-200 dark:bg-mirage-600 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                                                <Mail className="w-6 h-6 text-mirage-600 dark:text-mirage-300 transition-colors group-hover:text-mirage-700 dark:group-hover:text-mirage-200" />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="text-sm font-medium text-mirage-600 dark:text-mirage-200 transition-colors group-hover:text-mirage-700 dark:group-hover:text-mirage-100">
                                                    {club.name}
                                                </h4>
                                                <span className="text-xs bg-mirage-100 dark:bg-mirage-800 text-mirage-500 dark:text-mirage-300 px-2 py-0.5 rounded-full transition-colors group-hover:bg-mirage-200 dark:group-hover:bg-mirage-700">
                                                    Collaborator
                                                </span>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    id={club._id}
                                                    checked={selectedCollateralClubs.includes(club._id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleCheckboxChange(club._id);
                                                    }}
                                                    className="w-5 h-5 text-mirage-600 dark:text-mirage-400 border-mirage-300 dark:border-mirage-600 rounded cursor-pointer transition-all hover:ring-2 hover:ring-mirage-400 dark:hover:ring-mirage-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditEvents;