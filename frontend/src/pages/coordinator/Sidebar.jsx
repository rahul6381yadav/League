import {
    BellIcon,
    ClipboardListIcon,
    HomeIcon,
    LogoutIcon,
    UserCircleIcon,
    UserGroupIcon,
} from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/ThemeContext";
import Tooltip from '../common/Tooltip_sidebar';
import { FaMoon, FaSun } from "react-icons/fa";

const CoordinatorSidebar = ({ onToggle }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const location = useLocation();

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
        { icon: <HomeIcon className="h-6 w-6" />, label: "Home", path: "/dashboard" },
        { icon: <UserGroupIcon className="h-6 w-6" />, label: "Club Details", path: "/my-club" },
        { icon: <ClipboardListIcon className="h-6 w-6" />, label: "Manage Events", path: "/manage-events" },
        { icon: <BellIcon className="h-6 w-6" />, label: "Notifications", path: "#" },
        { icon: <UserCircleIcon className="h-6 w-6" />, label: "Members", path: "#" },
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
            <div className={`hidden md:block bg-mirage-50 dark:bg-mirage-800 shadow-md fixed h-full`}>
                {renderSidebar()}
            </div>

            <div className="z-100 fixed bottom-0 left-0 w-full bg-mirage-50 dark:bg-mirage-800 shadow-md md:hidden lg:hidden">
                <div className="flex justify-between px-4 py-2">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.path}
                            className="flex flex-col items-center text-mirage-900 dark:text-mirage-200 hover:text-mirage-600 dark:hover:text-mirage-400"
                        >
                            {item.icon}
                            <span className="text-xs">{item.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );

    function renderSidebar() {
        return (
            <div
                className={`fixed ${isCollapsed ? "w-16" : "w-64"} top-0 left-0 h-screen dark:bg-mirage-800 dark:text-mirage-50 bg-mirage-200 
                text-mirage-900 transition-all duration-300 z-100`}
            >
                <div className="flex items-center justify-between p-4">
                    {!isCollapsed && <span className="text-lg font-bold">Welcome, User!</span>}
                    <button
                        className="p-2 rounded hover:bg-mirage-300 dark:hover:bg-mirage-700"
                        onClick={toggleSidebar}
                    >
                        <span className="material-icons">
                            {isCollapsed ? "menu" : "close"}
                        </span>
                    </button>
                </div>

                <ul className="mt-6 ml-3 space-y-2">
                    {menuItems.map((item, idx) => (
                        <li
                            key={idx}
                            className={`flex items-center space-x-4 p-2 rounded cursor-pointer
                            ${location.pathname === item.path
                                ? "bg-mirage-600 text-white shadow-md"
                                : "hover:bg-mirage-300 dark:hover:bg-mirage-700"
                            }`}
                            onClick={() => navigate(item.path)}
                        >
                            <Tooltip text={item.label} show={isCollapsed}>
                                <span className="text-lg">{item.icon}</span>
                            </Tooltip>
                            {!isCollapsed && <span>{item.label}</span>}
                        </li>
                    ))}
                </ul>

                <div className="absolute bottom-0 left-0 w-full">
                    <div
                        className="ml-3 flex items-center p-2 mb-2 hover:bg-mirage-300 dark:hover:bg-mirage-700 rounded cursor-pointer"
                        onClick={toggleDarkMode}
                    >
                        <Tooltip text={isDarkMode ? "Dark Mode" : "Light Mode"} show={isCollapsed}>
                            {isDarkMode ? (
                                    <FaMoon className="h-6 w-6 text-mirage-50" />

                            ) : (
                                <FaSun className="h-6 w-6" />
                            )}
                        </Tooltip>
                        {!isCollapsed && (
                            <span className="ml-4">{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
                        )}
                    </div>

                    <div
                        className="ml-3 flex items-center p-2 mb-4 hover:bg-mirage-300 dark:hover:bg-mirage-700 rounded cursor-pointer"
                        onClick={handleLogout}
                    >
                        <Tooltip text="Log Out" show={isCollapsed}>
                            <LogoutIcon className="h-6 w-6" />
                        </Tooltip>
                        {!isCollapsed && <span className="ml-4">Log Out</span>}
                    </div>
                </div>
            </div>
        );
    }
};

export default CoordinatorSidebar;