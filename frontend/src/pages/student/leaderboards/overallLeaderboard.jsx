import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Mail, Trophy, Search, Filter, Users, ChevronDown, Medal, Award, Crown } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { backendUrl } from "../../../utils/routes";

const Leaderboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [batchList, setBatchList] = useState([]);
    const [leaderboardView, setLeaderboardView] = useState("compact");

    const navigate = useNavigate();
    const filterRef = useRef(null);

    const token = localStorage.getItem("jwtToken");
    const decodedToken = token ? jwtDecode(token) : null;
    const userId = decodedToken?.userId;

    // Extract unique batches from student list
    const extractBatches = (studentsList) => {
        const batches = studentsList
            .filter(s => s.batchCode)
            .map(s => s.batchCode)
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort();
        return batches;
    };

    const getHighestScore = () => {
        if (!students.length) return 100;
        const maxScore = Math.max(...students.map(s => s.TotalPoints || 0));
        return maxScore > 0 ? maxScore : 100;
    };

    const maxPoints = getHighestScore();
    const topStudent = students.length > 0 ? students[0] : null;

    useEffect(() => {
        const fetchStudentsAndUserProfile = async () => {
            try {
                setLoading(true);

                // Fetch all students
                const studentsResponse = await axios.get(`${backendUrl}/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        role: "student",
                    },
                });

                // Sort students by points then by ID
                const sortedStudents = studentsResponse.data.users.sort((a, b) => {
                    if ((b.TotalPoints || 0) !== (a.TotalPoints || 0)) {
                        return (b.TotalPoints || 0) - (a.TotalPoints || 0);
                    }
                    return a.studentId?.localeCompare(b.studentId);
                });

                setStudents(sortedStudents);

                // Extract unique batches
                const batches = extractBatches(sortedStudents);
                setBatchList(batches);

                // Fetch current user's profile if logged in
                if (userId) {
                    const userResponse = await axios.get(`${backendUrl}/user/profile/`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            id: userId,
                        },
                    });
                    setCurrentUser(userResponse.data.user);
                }
            } catch (err) {
                setError(err.message || "Failed to fetch students.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsAndUserProfile();
    }, [userId]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setFilterMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [filterRef]);

    const getFilteredStudents = () => {
        if (!students.length) return [];

        let filtered = [...students];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(student =>
                (student.fullName && student.fullName.toLowerCase().includes(searchLower)) ||
                (student.email && student.email.toLowerCase().includes(searchLower)) ||
                (student.studentId && student.studentId.toLowerCase().includes(searchLower))
            );
        }

        if (activeFilter !== "all" && activeFilter !== "top-10") {
            if (activeFilter === "my-batch" && currentUser?.batchCode) {
                filtered = filtered.filter(student =>
                    student.batchCode === currentUser.batchCode
                );
            } else {
                filtered = filtered.filter(student =>
                    student.batchCode === activeFilter
                );
            }
        }

        if (activeFilter === "top-10") {
            filtered = filtered.slice(0, 10);
        }

        return filtered;
    };

    const filteredStudents = getFilteredStudents();

    const getCurrentUserRank = () => {
        const userIndex = students.findIndex(student => student._id === userId);
        return userIndex > -1 ? userIndex + 1 : null;
    };

    const currentUserRank = getCurrentUserRank();

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown size={18} className="text-yellow-500" />;
        if (rank === 2) return <Medal size={18} className="text-gray-400" />;
        if (rank === 3) return <Award size={18} className="text-amber-600" />;
        return <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">{rank}</span>;
    };

    if (loading) return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-12 bg-indigo-200/50 dark:bg-indigo-800/30 rounded-lg w-1/3"></div>

                    <div className="flex justify-between items-center">
                        <div className="h-10 bg-indigo-200/50 dark:bg-indigo-800/30 rounded-lg w-1/4"></div>
                        <div className="flex gap-3">
                            <div className="h-10 w-32 bg-indigo-200/50 dark:bg-indigo-800/30 rounded-lg"></div>
                            <div className="h-10 w-32 bg-indigo-200/50 dark:bg-indigo-800/30 rounded-lg"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-24 bg-white/60 dark:bg-gray-800/60 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl p-6 max-w-md">
                <h3 className="text-red-700 dark:text-red-400 font-medium text-lg">Error Loading Leaderboard</h3>
                <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {currentUser && (
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-xl p-6 mb-6 text-white shadow-lg relative overflow-hidden z-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-16 -translate-y-32 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 translate-y-32 blur-xl"></div>

                        <div className="flex flex-col md:flex-row gap-6 items-center relative z-0">
                            <img
                                src={currentUser.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                alt="Your Profile"
                                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
                            />

                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold">{currentUser.fullName}</h2>
                                <p className="text-indigo-100">Batch {currentUser.batchCode} • {currentUser.studentId}</p>
                                {topStudent && currentUser._id !== topStudent._id && (
                                    <p className="text-indigo-200 text-sm mt-1">
                                        Current points: {currentUser.TotalPoints || 0}
                                        <span className="ml-1 opacity-75">(Top score: {topStudent.TotalPoints} points)</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col items-center text-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <div className="text-3xl font-bold">{currentUserRank}</div>
                                <div className="text-indigo-100 font-medium">Your Rank</div>
                            </div>

                            <div className="flex flex-col items-center text-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <div className="text-3xl font-bold">{currentUser.TotalPoints || 0}</div>
                                <div className="text-indigo-100 font-medium">Points</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-gray-500" size={18} />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, email, ID, or batch..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="relative z-50" ref={filterRef}>
                                <button
                                    onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-200 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-lg border border-indigo-300 dark:border-indigo-800/50 hover:bg-indigo-300 dark:hover:bg-indigo-800/50 shadow-sm"
                                >
                                    <Filter size={18} />
                                    <span className="font-medium">
                                        {activeFilter === "all" ? "All Students" :
                                            activeFilter === "top-10" ? "Top 10" :
                                                activeFilter === "my-batch" ? `My Batch (${currentUser?.batchCode})` :
                                                    `Batch ${activeFilter}`}
                                    </span>
                                    <ChevronDown size={16} />
                                </button>

                                {filterMenuOpen && (
                                    <div className="absolute z-50 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700 py-2">
                                        <button
                                            onClick={() => {
                                                setActiveFilter("all");
                                                setFilterMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${activeFilter === "all" ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}
                                        >
                                            All Students
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveFilter("top-10");
                                                setFilterMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${activeFilter === "top-10" ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}
                                        >
                                            Top 10
                                        </button>
                                        {currentUser && (
                                            <button
                                                onClick={() => {
                                                    setActiveFilter("my-batch");
                                                    setFilterMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${activeFilter === "my-batch" ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}
                                            >
                                                My Batch ({currentUser.batchCode})
                                            </button>
                                        )}

                                        {batchList.length > 0 && (
                                            <>
                                                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                                <div className="px-4 py-1 text-xs text-gray-500 dark:text-gray-400">Batch Filters</div>
                                                {batchList.map(batch => (
                                                    <button
                                                        key={batch}
                                                        onClick={() => {
                                                            setActiveFilter(batch);
                                                            setFilterMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${activeFilter === batch ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}
                                                    >
                                                        Batch {batch}
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex rounded-lg overflow-hidden border border-indigo-300 dark:border-indigo-800/50 shadow-sm">
                                <button
                                    onClick={() => setLeaderboardView("compact")}
                                    className={`px-3 py-2 ${leaderboardView === "compact"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-indigo-200 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"}`}
                                >
                                    Compact
                                </button>
                                <button
                                    onClick={() => setLeaderboardView("cards")}
                                    className={`px-3 py-2 ${leaderboardView === "cards"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-indigo-200 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"}`}
                                >
                                    Cards
                                </button>
                            </div>

                            <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg border border-yellow-300 dark:border-yellow-800/50 shadow-sm">
                                <span className="text-xs block">Highest Score</span>
                                <span className="font-semibold">{maxPoints} points</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            {filteredStudents.length === students.length ? (
                                <span>Showing all {students.length} students</span>
                            ) : (
                                <span>Showing {filteredStudents.length} of {students.length} students</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {searchTerm && (
                                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-medium">
                                    Search: "{searchTerm}"
                                </span>
                            )}
                            {activeFilter !== "all" && (
                                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-medium">
                                    {activeFilter === "top-10" ? "Top 10" :
                                        activeFilter === "my-batch" ? `Batch: ${currentUser?.batchCode}` :
                                            `Batch: ${activeFilter}`}
                                </span>
                            )}
                            {(searchTerm || activeFilter !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setActiveFilter("all");
                                    }}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {filteredStudents.length > 0 ? (
                    <>
                        {leaderboardView === "compact" && (
                            <div className="space-y-2">
                                {filteredStudents.map((student, index) => {
                                    const isCurrentUser = student._id === userId;
                                    const rank = students.findIndex(s => s._id === student._id) + 1;

                                    return (
                                        <div
                                            key={student._id}
                                            className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer
                                                ${isCurrentUser
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700'
                                                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                }
                                            `}
                                            onClick={() => {
                                                if (isCurrentUser) {
                                                    navigate('/myProfile');
                                                } else {
                                                    navigate(`/friends/${student._id}`);
                                                }
                                            }}
                                        >
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                                rank === 2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                                                    rank === 3 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                                        'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                }`}>
                                                {rank <= 3 ? getRankIcon(rank) : rank}
                                            </div>

                                            <img
                                                className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                                                src={student.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                alt=""
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                    <span className="truncate">{student.fullName}</span>
                                                    {isCurrentUser && (
                                                        <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="mr-2">Batch {student.batchCode}</span>
                                                    <span>{student.studentId}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <div className="flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 dark:bg-indigo-900/30">
                                                    <Trophy className="text-indigo-400 dark:text-indigo-500 mr-1" size={16} />
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                        {student.TotalPoints || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {leaderboardView === "cards" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredStudents.map((student, index) => {
                                    const isCurrentUser = student._id === userId;
                                    const rank = students.findIndex(s => s._id === student._id) + 1;

                                    return (
                                        <div
                                            key={student._id}
                                            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all ${isCurrentUser ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''
                                                }`}
                                            onClick={() => {
                                                if (isCurrentUser) {
                                                    navigate('/myProfile');
                                                } else {
                                                    navigate(`/friends/${student._id}`);
                                                }
                                            }}
                                        >
                                            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2"></div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img
                                                            className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900"
                                                            src={student.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                                            alt=""
                                                        />
                                                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full text-xs text-white font-medium ${rank === 1 ? 'bg-yellow-500' :
                                                            rank === 2 ? 'bg-gray-400' :
                                                                rank === 3 ? 'bg-amber-600' :
                                                                    'bg-indigo-500'
                                                            }`}>
                                                            {rank}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                            {student.fullName}
                                                            {isCurrentUser && (
                                                                <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                                                    You
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {student.studentId} • Batch {student.batchCode}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Points</div>
                                                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                                {student.TotalPoints || 0}
                                                            </div>
                                                        </div>
                                                        <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3">
                                                            <Trophy className="h-6 w-6 text-indigo-500" />
                                                        </div>
                                                    </div>

                                                    {student._id === topStudent?._id && (
                                                        <div className="text-xs text-yellow-500 font-semibold mt-2">
                                                            Highest Score
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">
                        <Users size={48} className="mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchTerm ? "Try adjusting your search terms." : "There are no students matching the selected filters."}
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setActiveFilter("all");
                            }}
                            className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    <p>IIIT Raichur League • Overall Student Leaderboard</p>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;