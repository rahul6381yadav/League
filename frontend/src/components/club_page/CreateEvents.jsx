import React, { useState, useEffect } from 'react';

function CreateEvents({ primaryClubId, primaryClubName }) {
    const [collateralClubs, setCollateralClubs] = useState([]);
    const [selectedCollateralClubs, setSelectedCollateralClubs] = useState([]);
    const token = localStorage.getItem("authToken");
    const [eventData, setEventData] = useState({
        eventName: '',
        description: '',
        vanue: '',
        duration: '',
        maxPoints: '',
        date: '',
    });

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/v1/club`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                const filteredClubs = data.clubs.filter((club) => club._id !== primaryClubId);
                setCollateralClubs(filteredClubs);
            } catch (error) {
                console.error('Error fetching clubs:', error);
            }
        };

        fetchClubs();
    }, [primaryClubId]);

    
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

        const clubIds = [primaryClubId, ...selectedCollateralClubs];
        const newEvent = { ...eventData, clubIds };
        try {
            const response = await fetch('http://localhost:4000/api/v1/club/events', {
                method: 'POST',
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
                setEventData({
                    eventName: '',
                    description: '',
                    vanue: '',
                    duration: '',
                    maxPoints: '',
                    date: '',
                });
                alert('Event created successfully!');
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <form
                onSubmit={handleFormSubmit}
                className="bg-white dark:bg-gray-800 p-6 text-gray-900 dark:text-gray-100 shadow-md rounded-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-semibold mb-6 text-center">Create Event</h2>


                {/* Primary Club */}
                <label className="block mb-2 font-medium">Primary Club:</label>
                <p className="mb-4 p-3 bg-gray-200 dark:bg-gray-700 text-black dark:text-gray-100 rounded">
                    {primaryClubName}
                </p>

                {/* Collateral Clubs */}
                <label className="block mb-2 font-medium">Collateral Clubs (Optional):</label>
                <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
                    {collateralClubs.map((club) => (
                        <div key={club._id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={club._id}
                                value={club._id}
                                checked={selectedCollateralClubs.includes(club._id)}
                                onChange={() => handleCheckboxChange(club._id)}
                                className="mr-2"
                            />
                            <label htmlFor={club._id} className="text-sm">
                                {club.name}
                            </label>
                        </div>
                    ))}
                </div>

                {/* Event Details */}
                <label className="block mb-2 font-medium">Event Name:</label>
                <input
                    type="text"
                    name="eventName"
                    placeholder ="Enter event name"
                    value={eventData.eventName}
                    onChange={handleInputChange}
                    className="w-full mb-4 p-3 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-gray-100"
                    required
                />

                <label className="block mb-2 font-medium">Description:</label>
                <textarea
                    name="description"
                    placeholder="Enter description"
                    value={eventData.description}
                    onChange={handleInputChange}
                    className="w-full mb-4 p-3 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-gray-100"
                />

                <label className="block mb-2 font-medium">Venue:</label>
                <input
                    type="text"
                    name="vanue"
                    placeholder="Enter venue"
                    value={eventData.vanue}
                    onChange={handleInputChange}
                    className="w-full mb-4 p-3 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-gray-100"
                    required
                />

                <label className="block mb-2 font-medium">Duration:</label>
                <input
                    type="text"
                    name="duration"
                    placeholder="Enter duration"
                    value={eventData.duration}
                    onChange={handleInputChange}
                    className="w-full mb-4 p-3 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-gray-100"
                    required
                />

                <label className="block mb-2 font-medium">Maximum Points:</label>
                <input
                    type="number"
                    name="maxPoints"
                    placeholder="Enter maximum points"
                    value={eventData.maxPoints}
                    onChange={handleInputChange}
                    className="w-full mb-4 p-3 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-gray-100"
                    required
                />

                <label className="block mb-2 font-medium">Event Date:</label>
                <input
                    type="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleInputChange}
                    className="w-full mb-6 p-3 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-gray-100"
                    required
                />

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-3 px-4 rounded w-full transition"
                >
                    Create Event
                </button>
            </form>
        </div>

    );
}

export default CreateEvents;