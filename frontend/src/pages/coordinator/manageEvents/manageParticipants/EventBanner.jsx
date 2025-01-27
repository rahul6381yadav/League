import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { backendUrl } from "../../../../utils/routes";
import { useNavigate } from 'react-router-dom';

const token = localStorage.getItem("jwtToken");
let decodedToken = null;
if (token) {
    try {
        decodedToken = jwtDecode(token);
    } catch (error) {
        console.error("Error decoding JWT token:", error.message);
    }
}

const EventBanner = (props) => {
    console.log("props ", props);
    const id = props.props.eventId;
    const [event, setEvent] = useState(null);
    const navigate = useNavigate();
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
        fetchEventDetails();
    }, [id,token]);
    return (
        <div className="flex flex-col bg-white dark:bg-mirage-800 rounded-lg shadow-md flex-1">
                                <div className="relative w-full rounded-t-lg" style={{ paddingBottom: '42.8571%' }}>
        
                                    <div className="absolute top-0 left-0 w-full h-full bg-mirage-200 dark:bg-mirage-600 flex items-center justify-center rounded-t-lg">
                                        {event && event.photo ? (
                                            <img
                                                src={event.photo}
                                                alt="Event Banner"
                                                className="w-full h-full object-cover rounded-t-lg"
                                            />
                                        ) : (
                                            <span className="text-mirage-600 dark:text-mirage-300">Banner Placeholder</span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
        
                                    <div className="relative flex justify-end">
                                        <button
                                            onClick={() => {
                                                navigate(`/events/edit/${event._id}`)
                                            }}
                                            className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-md w-24 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
                                            Edit Events
                                        </button>
                                    </div>
                                    {event ? (
                                        <>
                                            <h1 className="text-3xl font-bold text-mirage-600 dark:text-mirage-100 mb-4">{event.eventName}</h1>
        
        
                                            <div className="space-y-4 flex-1">
                                                <div className="space-y-2">
                                                    <div
                                                        className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                                                        <FaCalendarAlt className="mr-2 text-mirage-500" />
                                                        <span className="mr-2">Date:</span>
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </div>
                                                    <div
                                                        className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                                                        <FaMapMarkerAlt className="mr-2 text-mirage-500" />
                                                        <span className="mr-2">Venue:</span>
                                                        {event.venue}
                                                    </div>
                                                    <div
                                                        className="flex items-center text-mirage-600 dark:text-mirage-200 text-sm">
                                                        <FaClock className="mr-2 text-mirage-500" />
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
    );
}
export default EventBanner;