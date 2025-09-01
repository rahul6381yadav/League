import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { backendUrl } from "../../../utils/routes";

function Clubs() {
    const [clubs, setClubs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [ratingMin, setRatingMin] = useState(0);
    const [ratingMax, setRatingMax] = useState(5);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem("jwtToken");

    const handleClubsDetails = async () => {
        setLoading(true);
        const validatedMin = Math.max(0, Math.min(ratingMin, 5));
        const validatedMax = Math.max(validatedMin, Math.min(ratingMax, 5));

        try {
            const queryParams = new URLSearchParams({
                search: searchQuery,
                ratingMin: validatedMin,
                ratingMax: validatedMax,
            }).toString();

            const response = await fetch(`${backendUrl}/api/v1/club?${queryParams}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (!result || !result.clubs) {
                console.error("Unexpected API response format:", result);
                setClubs([]);
                return;
            }

            const processedClubs = result.clubs.map(club => ({
                ...club,
                processedImage: club.image || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            }));

            setClubs(processedClubs);
        } catch (err) {
            console.error("Error fetching clubs:", err);
            setClubs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const handleMinRatingChange = (e) => {
        let value = Number(e.target.value);
        value = Math.max(0, Math.min(value, ratingMax, 5));
        setRatingMin(value);
    };

    const handleMaxRatingChange = (e) => {
        let value = Number(e.target.value);
        value = Math.max(ratingMin, Math.min(value, 5));
        setRatingMax(value);
    };

    useEffect(() => {
        handleClubsDetails();
    }, [searchQuery, ratingMin, ratingMax]);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>);
        }

        if (hasHalfStar) {
            stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400"></i>);
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300 dark:text-gray-600"></i>);
        }

        return stars;
    };

    return (
        <div className="min-h-screen bg-transparent py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-300">
                    <span className="animate-gradient-text">Discover Clubs</span>
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                        <div className="relative flex-1 mb-4 md:mb-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-indigo-400"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Search for a club..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-3 py-3 border-2 border-indigo-200 focus:border-violet-400 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Rating:</span>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    value={ratingMin}
                                    onChange={handleMinRatingChange}
                                    className="w-20 py-2 px-3 border-2 border-indigo-200 focus:border-violet-400 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                />
                                <span className="text-gray-600 dark:text-gray-300">to</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    value={ratingMax}
                                    onChange={handleMaxRatingChange}
                                    className="w-20 py-2 px-3 border-2 border-indigo-200 focus:border-violet-400 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                )}

                {!loading && (
                    <>
                        {clubs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex rounded-full bg-indigo-100 dark:bg-indigo-900 p-4 mb-4">
                                    <i className="fas fa-search-minus text-indigo-500 dark:text-indigo-300 text-3xl"></i>
                                </div>
                                <p className="text-xl text-gray-600 dark:text-gray-300">No clubs found matching your criteria</p>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {clubs.map((club) => (
                                    <div
                                        key={club._id}
                                        onClick={() => navigate('/club-events', {
                                            state: { clubId: club._id, clubEmail: club.email, clubName: club.name },
                                        })}
                                        className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800"
                                    >
                                        <div className="absolute inset-0 transition-opacity duration-300 z-10"></div>

                                        <div className="aspect-[16/9] w-full overflow-hidden">
                                            <img
                                                src={club.processedImage || club.image || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"}
                                                alt={club.name}
                                                className="w-full h-full object-contain object-center bg-gray-100 dark:bg-gray-700 transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";
                                                }}
                                            />
                                        </div>

                                        <div className="p-4 bg-white dark:bg-gray-800 z-20 relative">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                                                    {club.name}
                                                </h3>
                                                <div className="flex">
                                                    {renderStars(club.overallRating)}
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">
                                                {club.description || "Join this exciting club and participate in various activities and events."}
                                            </p>

                                            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <i className="fas fa-envelope mr-2"></i>
                                                    <span className="truncate">{club.email}</span>
                                                </div>
                                                <div className="mt-3 flex justify-end">
                                                    <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors duration-300 group-hover:bg-violet-600">
                                                        View Events
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add CSS for animated gradient text */}
            <style jsx>{`
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-text {
                    background-size: 200% auto;
                    animation: gradient-shift 4s ease infinite;
                }
            `}</style>
        </div>
    );
}

export default Clubs;
