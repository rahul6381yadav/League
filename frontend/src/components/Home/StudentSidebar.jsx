import {
    HomeIcon,
    ClipboardListIcon,
    FolderIcon,
    ChartSquareBarIcon,
    SparklesIcon,
    BellIcon,
    CogIcon,
    LogoutIcon,
    UserGroupIcon,
} from "@heroicons/react/outline";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar = ({ onToggle }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isAuthenticated, setIsAuthenticated } = useAuth();
    const navigate = useNavigate();
    const email = localStorage.getItem("emailCont");

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        onToggle(!isCollapsed); // Notify the parent about the change
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        navigate("/");
    };

    useEffect(() => {
        const checkAuthStatus = () => {
            const token = localStorage.getItem("authToken");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const currentTime = Date.now() / 1000; // Current time in seconds
                    if (decoded.exp > currentTime) {
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem("authToken");
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    localStorage.removeItem("authToken");
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuthStatus();

        // Optional: Check periodically
        const interval = setInterval(checkAuthStatus, 10000); // Check every 1 minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={`fixed top-0 left-0 h-screen bg-gray-800 text-white px-4 ${isCollapsed ? "w-16" : "w-72"
                } transition-all duration-300 z-50`}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-2">
                    {!isCollapsed && (
                        <span className="text-lg font-bold">Leaderboard</span>
                    )}
                </div>
                <button
                    className="p-2 rounded hover:bg-gray-700"
                    onClick={toggleSidebar}
                >
                    <span className="material-icons">
                        {isCollapsed ? "menu" : "close"}
                    </span>
                </button>
            </div>

            {/* Sidebar Menu */}
            <ul className="mt-6 space-y-2">
                {[{
                    icon: <HomeIcon className="h-6 w-6" />,
                    label: "Home",
                    path: "/home"
                },
                {
                    icon: <UserGroupIcon className="h-6 w-6" />,
                    label: "All Clubs",
                    path: "/Clubs"
                },
                {
                    icon: <ClipboardListIcon className="h-6 w-6" />,
                    label: "My Events",
                    path: "/my-events"
                },
                {
                    icon: <ClipboardListIcon className="h-6 w-6" />,
                    label: "All Events",
                    path: "/all-events"
                },
                {
                    icon: <SparklesIcon className="h-6 w-6" />,
                    label: "My Batch Leaderboard",
                    path: "/batch-leaderboard"
                },
                {
                    icon: <SparklesIcon className="h-6 w-6" />,
                    label: "Overall Leaderboard",
                    path: "/overall-leaderboard"
                },
                {
                    icon: <ChartSquareBarIcon className="h-6 w-6" />,
                    label: "My Achievements",
                    path: "/my-achievements"
                },
                {
                    icon: <UserGroupIcon className="h-6 w-6" />,
                    label: "My Profile",
                    path: "/profile"
                }].map((item, idx) => (
                    <li
                        key={idx}
                        className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded"
                        onClick={() => {
                            console.log("isAuthenticated ", isAuthenticated);
                            if (isAuthenticated === false) {
                                handleLogout();
                            }
                            navigate(item.path);
                        }}
                    >
                        <span className="text-lg">{item.icon}</span>
                        {!isCollapsed && <span>{item.label}</span>}
                    </li>
                ))}
            </ul>

            {/* Sidebar Footer */}
            <div className="absolute bottom-4">
                <ul className="space-y-2">
                    {[{
                        icon: <BellIcon className="h-6 w-6" />,
                        label: "Notifications",
                        path: "/notifications"
                    },
                    {
                        icon: <CogIcon className="h-6 w-6" />,
                        label: "Settings",
                        path: "/settings"
                    }].map((item, idx) => (
                        <li
                            key={idx}
                            className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded"
                            onClick={() => navigate(item.path)}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {!isCollapsed && <span>{item.label}</span>}
                        </li>
                    ))}
                </ul>
                <div className="flex items-center mt-4 p-2 hover:bg-gray-700 rounded">
                    <div className="h-8 w-8 bg-gray-500 rounded-full"></div>
                    {!isCollapsed && (
                        <div className="ml-2">
                            <p className="text-sm">Brooklyn Simmons</p>
                            <p className="text-xs text-gray-400">
                                {email}
                            </p>
                        </div>
                    )}
                </div>
                {/* Log Out Button */}
                <div
                    className="flex items-center mt-4 p-2 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={handleLogout}
                >
                    <LogoutIcon className="h-6 w-6" />
                    {!isCollapsed && <span className="ml-4">Log Out</span>}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
