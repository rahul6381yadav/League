import {
    ArchiveIcon,
    ChartSquareBarIcon,
    ClipboardCheckIcon,
    CogIcon,
    HomeIcon,
    LogoutIcon,
    SparklesIcon,
    StarIcon,
    UserCircleIcon,
    UserGroupIcon
} from "@heroicons/react/outline";
import {useEffect, useState} from "react";
import {useAuth} from "../../context/AuthContext";
import {useLocation, useNavigate} from "react-router-dom";
import Tooltip from '../common/Tooltip_sidebar';
import {FaMoon, FaSun, FaTachometerAlt, FaUser, FaUsers} from "react-icons/fa";
import {useDarkMode} from "../../context/ThemeContext";

const Sidebar = ({onToggle}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const {logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {isDarkMode, toggleDarkMode} = useDarkMode();

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        onToggle(!isCollapsed);
    };

    const handleLogout = async () => {
        try {
            const confirm = window.confirm('Are you sure you want to logout?');
            if (confirm) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("jwtToken");

                await logout();
                console.log("User logged out successfully");
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const menuItems = [
        { icon: <HomeIcon className="h-6 w-6" />, label: "Home", path: "/home" },
        { icon: <UserGroupIcon className="h-6 w-6" />, label: "All Clubs", path: "/clubs" },
        { icon: <ClipboardCheckIcon className="h-6 w-6" />, label: "My Events", path: "/my-events" },
        { icon: <ArchiveIcon className="h-6 w-6" />, label: "All Events", path: "/all-events" },
        { icon: <SparklesIcon className="h-6 w-6" />, label: "My Batch Leaderboard", path: "/batch-leaderboard" },
        { icon: <StarIcon className="h-6 w-6" />, label: "Overall Leaderboard", path: "/overall-leaderboard" },
        { icon: <ChartSquareBarIcon className="h-6 w-6" />, label: "My Achievements", path: "/my-achievements" },
        { icon: <UserCircleIcon className="h-6 w-6" />, label: "My Profile", path: "/myProfile" },
        { icon: <FaUsers className="h-6 w-6" />, label: "Friends", path: "/friends" },
    ];

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 820) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <>
            <div className={`hidden md:block bg-mirage-100 dark:bg-mirage-800 shadow-md fixed h-full`}>
                {renderSidebar()}
            </div>

            {/* Mobile Bottom NavBar */}
            <div
                className="z-100 fixed bottom-0 left-0 w-full bg-mirage-100 dark:bg-mirage-800 shadow-md md:hidden lg:hidden">
                <div className="flex justify-between px-4 py-2">
                    {[{ name: "Home", icon: <FaTachometerAlt className="h-6 w-6" />, href: "/home" },
                        { name: "Clubs", icon: <FaUsers className="h-6 w-6" />, href: "/clubs" },
                        { name: "Events", icon: <ArchiveIcon className="h-6 w-6" />, href: "/all-events" },
                        { name: "My Events", icon: <ClipboardCheckIcon className="h-6 w-6" />, href: "/my-events" },
                        { name: "Profile", icon: <FaUser className="h-6 w-6" />, href: "/myProfile" }]
                        .map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className="flex flex-col items-center text-mirage-800 dark:text-mirage-100 hover:text-mirage-500 dark:hover:text-mirage-400"
                            >
                                {item.icon}
                                <span className="text-xs">{item.name}</span>
                            </a>
                        ))}
                </div>
            </div>
        </>
    );

    function renderSidebar() {
        return (
            <div
                className={`fixed top-0 left-0 h-screen dark:bg-mirage-800 dark:text-mirage-50 bg-mirage-200 text-mirage-800 
                transition-all duration-300 z-50 ${isCollapsed ? "w-16" : "w-64"}`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                        {!isCollapsed && (
                            <span className="text-lg ml-2 font-bold text-mirage-800 dark:text-mirage-50">Leaderboard</span>
                        )}
                    </div>
                    <button
                        className="p-2 rounded hover:bg-mirage-300 dark:hover:bg-mirage-700"
                        onClick={toggleSidebar}
                    >
                        <span className="material-icons">
                            {isCollapsed ? "menu" : "close"}
                        </span>
                    </button>
                </div>

                {/* Sidebar Menu */}
                <ul className="mt-6 space-y-2 px-3">
                    {menuItems.map((item, idx) => (
                        <li
                            key={idx}
                            className={`flex items-center space-x-4 p-2 rounded cursor-pointer w-full
                            ${location.pathname === item.path
                                ? "bg-mirage-600 text-white dark:text-mirage-50"
                                : "hover:bg-mirage-300 dark:hover:bg-mirage-700 text-mirage-800 dark:text-mirage-50"
                            }`}
                            onClick={() => navigate(item.path)}
                        >
                            <Tooltip text={item.label} show={isCollapsed}>
                                <span className={`text-lg ${location.pathname === item.path ? "text-white dark:text-mirage-50" : ""}`}>
                                    {item.icon}
                                </span>
                            </Tooltip>
                            {!isCollapsed && <span>{item.label}</span>}
                        </li>
                    ))}
                </ul>

                {/* Sidebar Footer */}
                <div className="absolute bottom-4 w-full px-3">
                    <ul className="space-y-2">
                        {[{icon: <CogIcon className="h-6 w-6"/>, label: "Settings", path: "/settings"}]
                            .map((item, idx) => (
                                <li
                                    key={idx}
                                    className={`flex items-center space-x-4 p-2 rounded cursor-pointer w-full
                                    ${location.pathname === item.path
                                        ? "bg-mirage-600 text-mirage-50"
                                        : "hover:bg-mirage-300 dark:hover:bg-mirage-700 text-mirage-800 dark:text-mirage-50"
                                    }`}
                                    onClick={() => navigate(item.path)}
                                >
                                    <Tooltip text={item.label} show={isCollapsed}>
                                        <span className={`text-lg ${location.pathname === item.path ? "text-white dark:text-mirage-50" : ""}`}>
                                            {item.icon}
                                        </span>
                                    </Tooltip>
                                    {!isCollapsed && <span>{item.label}</span>}
                                </li>
                            ))}
                    </ul>

                    {/* Dark Mode Toggle */}
                    <div
                        className="flex items-center mt-4 p-2 hover:bg-mirage-300 dark:hover:bg-mirage-700 rounded cursor-pointer w-full"
                        onClick={toggleDarkMode}
                    >
                        <Tooltip text={isDarkMode ? "Dark Mode" : "Light Mode"} show={isCollapsed}>
                            {isDarkMode ? (
                                <FaMoon className="h-6 w-6 text-mirage-50"/>
                            ) : (
                                <FaSun className="h-6 w-6"/>
                            )}
                        </Tooltip>
                        {!isCollapsed && (
                            <span className="ml-5 text-mirage-800 dark:text-mirage-50">
                                {isDarkMode ? "Dark Mode" : "Light Mode"}
                            </span>
                        )}
                    </div>

                    {/* Log Out Button */}
                    <div
                        className="flex items-center mt-4 p-2 hover:bg-mirage-300 dark:hover:bg-mirage-700 rounded cursor-pointer w-full"
                        onClick={handleLogout}
                    >
                        <Tooltip text="Log Out" show={isCollapsed}>
                            <LogoutIcon className="h-6 w-6"/>
                        </Tooltip>
                        {!isCollapsed && <span className="ml-5 text-mirage-800 dark:text-mirage-50">Log Out</span>}
                    </div>
                </div>
            </div>
        );
    }
};

export default Sidebar;