import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ViewEvents from '../../coordinator/manageEvents/components/ViewEvents';
import { backendUrl } from '../../../utils/routes';

const ClubEvents = () => {
    const [clubDetails, setClubDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();
    const { clubId, clubName } = location.state || {};
    const navigate = useNavigate();

    // Fetch club details
    useEffect(() => {
        const fetchClubDetails = async () => {
            if (!clubId) {
                setError("Club ID is missing");
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('jwtToken');
                const response = await fetch(`${backendUrl}/api/v1/club?id=${clubId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch club details: ${response.status}`);
                }

                const data = await response.json();
                setClubDetails(data.club);
            } catch (err) {
                console.error("Error fetching club details:", err);
                setError(err.message || "Failed to fetch club details");
            } finally {
                setLoading(false);
            }
        };

        fetchClubDetails();
    }, [clubId]);

    // Function to handle empty events state visibility
    const shouldShowEmptyState = (events) => {
        return !events || events.length === 0;
    };

    // Club Logo component 
    const ClubLogo = ({ club }) => {
        if (!club || !club.image) return null;

        return (
            <img
                src={club.image}
                alt={`${club.name} Logo`}
                className="h-10 w-10 rounded-full object-cover border-2 border-indigo-200 dark:border-violet-700 mr-3"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(club.name)}&background=8B5CF6&color=fff&size=64`;
                }}
            />
        );
    };

    // Empty Events State component with tattoo design for when no events are available
    const EmptyEventsState = () => {
        return (
            <div className="py-16 flex flex-col items-center justify-center relative">
                {/* Tattoo-inspired design */}
                <div className="absolute w-full max-w-md h-64 opacity-10 dark:opacity-5 pointer-events-none">
                    <svg viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <defs>
                            <linearGradient id="tattooGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4F46E5" />
                                <stop offset="100%" stopColor="#7E22CE" />
                            </linearGradient>
                        </defs>
                        <g fill="url(#tattooGradient)" stroke="url(#tattooGradient)" strokeWidth="2">
                            <path d="M250,50 C350,50 350,150 250,150 C150,150 150,50 250,50 Z" />
                            <path d="M250,70 C330,70 330,130 250,130 C170,130 170,70 250,70 Z" />
                            <circle cx="250" cy="100" r="15" />
                            <path d="M200,50 C220,30 230,30 250,50" strokeWidth="4" fill="none" />
                            <path d="M250,50 C270,30 280,30 300,50" strokeWidth="4" fill="none" />
                            <path d="M200,150 C220,170 230,170 250,150" strokeWidth="4" fill="none" />
                            <path d="M250,150 C270,170 280,170 300,150" strokeWidth="4" fill="none" />
                            <path d="M150,100 C170,120 180,120 200,100" strokeWidth="3" fill="none" />
                            <path d="M300,100 C320,120 330,120 350,100" strokeWidth="3" fill="none" />
                            <path d="M150,100 C170,80 180,80 200,100" strokeWidth="3" fill="none" />
                            <path d="M300,100 C320,80 330,80 350,100" strokeWidth="3" fill="none" />
                            <circle cx="150" cy="100" r="5" />
                            <circle cx="350" cy="100" r="5" />
                            <path d="M250,150 L250,200" strokeWidth="4" fill="none" />
                            <path d="M230,180 L270,180" strokeWidth="4" fill="none" />
                            <path d="M220,200 L280,200" strokeWidth="4" fill="none" />
                        </g>
                    </svg>
                </div>

                {/* Illustration */}
                <div className="relative w-40 h-40 z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-violet-200 dark:from-indigo-900 dark:to-violet-900 rounded-full opacity-50 animate-pulse"></div>
                    <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <svg className="w-20 h-20 text-indigo-400 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                </div>

                {/* Message */}
                <h3 className="mt-8 text-xl font-semibold text-gray-700 dark:text-gray-300">No Events Found</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md">
                    This club hasn't scheduled any events yet. Check back later!
                </p>

                {/* Decorative elements */}
                <div className="absolute w-64 h-64 -z-10">
                    <div className="absolute top-10 left-0 w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/20 opacity-40"></div>
                    <div className="absolute bottom-0 right-10 w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/20 opacity-40"></div>
                </div>
            </div>
        );
    };

    // Function to handle coordinator card click
    const handleCoordinatorClick = (coordinatorId) => {
        // Redirect to coordinator profile
        if (coordinatorId) {
            navigate(`/profile/${coordinatorId}`);
        }
    };

    // Coordinator card component
    const CoordinatorCard = ({ coordinator, title }) => {
        if (!coordinator) return null;

        return (
            <div
                onClick={() => handleCoordinatorClick(coordinator._id)}
                className="flex flex-col sm:flex-row items-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-md hover:shadow-lg border border-indigo-100 dark:border-violet-900 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
                {/* Coordinator photo with fallback */}
                <div className="flex-shrink-0 relative mb-3 sm:mb-0">
                    {coordinator.photo ? (
                        <img
                            src={coordinator.photo}
                            alt={coordinator.fullName}
                            className="w-20 h-20 rounded-lg object-cover border-2 border-indigo-300 dark:border-violet-500"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coordinator.fullName)}&background=8B5CF6&color=fff&size=128`;
                            }}
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                            {coordinator.fullName ? coordinator.fullName.charAt(0).toUpperCase() : 'C'}
                        </div>
                    )}

                    {/* Small badge indicating coordinator role */}
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {title}
                    </div>
                </div>

                {/* Coordinator details */}
                <div className="sm:ml-6 text-center sm:text-left flex-1">
                    <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                        {coordinator.fullName}
                    </h4>

                    {coordinator.department && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {coordinator.department}
                        </p>
                    )}

                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex flex-wrap items-center justify-center sm:justify-start">
                        <span className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full px-2 py-1">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {coordinator.email}
                        </span>
                    </p>
                </div>

                {/* View profile indicator */}
                <div className="mt-3 sm:mt-0 sm:ml-2 text-indigo-500 dark:text-indigo-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        );
    };

    // Component to render coordinator section based on available data
    const CoordinatorSection = () => {
        if (!clubDetails) return null;

        const hasCoordinator1 = clubDetails.coordinator1 && Object.keys(clubDetails.coordinator1).length > 0;
        const hasCoordinator2 = clubDetails.coordinator2 && Object.keys(clubDetails.coordinator2).length > 0;

        // No coordinators assigned
        if (!hasCoordinator1 && !hasCoordinator2) {
            return (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-indigo-300 dark:border-violet-700 rounded-lg text-center">
                    <svg className="w-8 h-8 mx-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">No coordinators assigned to this club</p>
                </div>
            );
        }

        return (
            <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Club Coordinators
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    {hasCoordinator1 &&
                        <CoordinatorCard
                            coordinator={clubDetails.coordinator1}
                            title={hasCoordinator2 ? "Coordinator 1" : "Coordinator"}
                        />
                    }
                    {hasCoordinator2 &&
                        <CoordinatorCard
                            coordinator={clubDetails.coordinator2}
                            title="Coordinator 2"
                        />
                    }
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950">
            {/* Header with club name */}
            <div className="relative py-10 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 dark:from-indigo-900/30 dark:to-violet-900/30 blur-sm"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative max-w-7xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 inline-flex items-center text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back to Clubs
                    </button>

                    {/* Club name with decorative elements */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mb-4"></div>
                        {/* Club name with logo on the same line */}
                        <div className="flex items-center justify-center">
                            {!loading && !error && clubDetails && clubDetails.image && <ClubLogo club={clubDetails} />}
                            <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-300 dark:via-purple-300 dark:to-violet-300">
                                {clubDetails?.name || clubName || "Club Events"}
                            </h1>
                        </div>
                        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"></div>
                    </div>

                    {/* Coordinator section */}
                    {!loading && !error && (
                        <div className="mt-6 px-4 md:px-8 max-w-3xl mx-auto">
                            <CoordinatorSection />
                        </div>
                    )}

                    {/* Show error if any */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-center">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Loading state */}
                    {loading && (
                        <div className="mt-6 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Events section with colorful container */}
            <div className="max-w-7xl mx-auto px-4 pb-12 -mt-6">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 dark:border-violet-900 overflow-hidden">
                    <div className="p-1">
                        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 h-1 w-full"></div>
                    </div>
                    <div className="p-6">
                        <ViewEvents
                            props={{ primaryClubId: clubId }}
                            emptyComponent={<EmptyEventsState />}
                            showEmptyState={shouldShowEmptyState}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubEvents;