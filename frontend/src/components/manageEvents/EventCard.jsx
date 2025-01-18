import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Import the AuthContext
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers } from "react-icons/fa";

const EventCard = ({ event }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isParticipated, setIsParticipated] = useState(false);
  const { userId, isAuthenticated } = useAuth(); // Access userId and authentication status
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (isPopupOpen && isAuthenticated) {
      checkParticipation();
    }
  }, [isPopupOpen, isAuthenticated]);

  const checkParticipation = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/v1/club/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          studentId: userId, // Use userId from AuthContext
          eventId: event._id,
        },
      });
      setIsParticipated(response.data.records.length > 0);
    } catch (error) {
      console.error("Error checking participation:", error.response || error.message);
    }
  };

  const handleSignUp = async () => {
    if (!isParticipated && isAuthenticated) {
      try {
        await axios.post(
            `http://localhost:4000/api/v1/club/attendance`,
            {
              studentId: userId, // Use userId from AuthContext
              eventId: event._id,
              pointsGiven: 0,
              status: "Present",
              isWinner: false,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );
        setIsParticipated(true);
        alert("Successfully signed up for the event!");
      } catch (error) {
        console.error("Error signing up for event:", error.response || error.message);
        alert("Failed to sign up for the event.");
      }
    }
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
      <>
        {/* Event Card */}
        <div
            className="p-4 border rounded-lg shadow-md bg-gradient-to-br from-pink-100 to-purple-300 dark:bg-gradient-to-br dark:from-purple-100 dark:to-blue-400 transform transition-all duration-200 hover:scale-105"
            onClick={togglePopup}
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-600 truncate">{event.eventName}</h3>
            <p className="text-sm text-gray-600 truncate">
              {event.description || "No description available"}
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-gray-600 text-sm">
                <FaCalendarAlt className="mr-2 text-blue-500" />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                {event.vanue}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <FaClock className="mr-2 text-green-500" />
                {event.duration}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <FaUsers className="mr-2 text-purple-500" />
                Participants: {event.participantsCount || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Popup Modal */}
        {isPopupOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">{event.eventName}</h3>
                <p className="text-gray-600 mb-4">{event.description || "No description available"}</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    {event.vanue}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaClock className="mr-2 text-green-500" />
                    {event.duration}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaUsers className="mr-2 text-purple-500" />
                    Participants: {event.participantsCount || 0}
                  </div>
                </div>

                {/* Collaborating Clubs Section */}
                {event.clubIds && event.clubIds.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Collaborating Clubs:</h4>
                      <div className="flex flex-wrap gap-4">
                        {event.clubIds.map((club) => (
                            <div key={club._id} className="text-center">
                              <img
                                  src={club.image}
                                  alt={club.name}
                                  className="w-12 h-12 rounded-full border border-gray-300"
                              />
                              <p className="text-xs text-gray-600 mt-1">{club.name}</p>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end mt-6 space-x-4">
                  <button
                      className={`px-4 py-2 rounded-lg ${
                          isParticipated
                              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                      onClick={handleSignUp}
                      disabled={isParticipated}
                  >
                    {isParticipated ? "Already Signed Up" : "Sign Up"}
                  </button>
                  <button
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      onClick={togglePopup}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  );
};

export default EventCard;
