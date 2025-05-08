import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/ThemeContext";
import { 
  Home, 
  Users, 
  Calendar, 
  Archive, 
  Award, 
  Star, 
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Settings,
  Bell
} from "lucide-react";

const Sidebar = ({ onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) onToggle(!isCollapsed);
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

  // Define menu items based on user role
  // This could be dynamically set based on role from context
  const isCoordinator = localStorage.getItem("role") === "coordinator";
  
  const coordinatorMenuItems = [
    { icon: <Home size={18} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Users size={18} />, label: "Club Details", path: "/my-club" },
    { icon: <Calendar size={18} />, label: "Manage Events", path: "/manage-events" },
    { icon: <Bell size={18} />, label: "Notifications", path: "/notifications" },
    { icon: <User size={18} />, label: "Members", path: "/members" },
  ];

  const studentMenuItems = [
    { icon: <Home size={18} />, label: "Home", path: "/home" },
    { icon: <Users size={18} />, label: "All Clubs", path: "/clubs" },
    { icon: <Calendar size={18} />, label: "My Events", path: "/my-events" },
    { icon: <Archive size={18} />, label: "All Events", path: "/all-events" },
    { icon: <Award size={18} />, label: "My Batch Leaderboard", path: "/batch-leaderboard" },
    { icon: <Star size={18} />, label: "Overall Leaderboard", path: "/leaderboard" },
    { icon: <User size={18} />, label: "My Profile", path: "/myProfile" },
  ];

  const menuItems = isCoordinator ? coordinatorMenuItems : studentMenuItems;

  // Smaller subset for mobile navigation
  const mobileMenuItems = isCoordinator 
    ? coordinatorMenuItems.slice(0, 5) 
    : [
        { icon: <Home size={18} />, label: "Home", path: "/home" },
        { icon: <Users size={18} />, label: "Clubs", path: "/clubs" },
        { icon: <Calendar size={18} />, label: "My Events", path: "/my-events" },
        { icon: <Archive size={18} />, label: "All Events", path: "/all-events" },
        { icon: <User size={18} />, label: "Profile", path: "/myProfile" }
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
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed h-full z-10">
        {renderSidebar()}
      </div>

      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-mirage-900 shadow-lg md:hidden z-10">
        <div className="flex justify-around px-1 py-2">
          {mobileMenuItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center px-2 py-1 rounded-lg ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => navigate(item.path)}
            >
              <div className="w-5 h-5">{item.icon}</div>
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  function renderSidebar() {
    return (
      <div
        className={`${
          isCollapsed ? "w-16" : "w-56"
        } h-screen bg-white dark:bg-mirage-900 shadow-lg transition-all duration-300 ease-in-out overflow-hidden border-r border-indigo-100 dark:border-mirage-700`}
      >
        {/* Logo/Brand Area */}
        <div className="p-4 flex items-center justify-between border-b border-indigo-100 dark:border-mirage-700">
          {!isCollapsed && (
            <div className="inline-block p-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transform rotate-1">
              <div className="bg-white dark:bg-mirage-900 p-1 rounded-md transform -rotate-1">
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  League of IIITR
                </h1>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-mirage-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="py-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          <ul className="space-y-1 px-2">
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center cursor-pointer rounded-lg
                  ${
                    location.pathname === item.path
                      ? isCollapsed 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" 
                        : "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400"
                      : "text-gray-700 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-mirage-800"
                  }
                  ${isCollapsed ? "justify-center py-3" : "px-3 py-2"}
                  transition-all duration-200
                `}
              >
                <div className={`flex items-center ${isCollapsed && location.pathname === item.path ? 'transform scale-110' : ''}`}>
                  <span className={location.pathname === item.path && isCollapsed ? 'text-white' : ''}>{item.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-3 whitespace-nowrap opacity-100 transition-opacity duration-200 font-medium">
                      {item.label}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 w-full border-t border-indigo-100 dark:border-mirage-700 py-3 px-2">
          <div className="space-y-1">
            {/* Theme Toggle */}
            <div
              onClick={toggleDarkMode}
              className={`
                flex items-center cursor-pointer rounded-lg
                text-gray-700 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-mirage-800
                ${isCollapsed ? "justify-center py-3" : "px-3 py-2"}
                transition-all duration-200
              `}
            >
              <span>{isDarkMode ? <Moon size={18} /> : <Sun size={18} />}</span>
              {!isCollapsed && (
                <span className="ml-3 whitespace-nowrap opacity-100 transition-opacity duration-200 font-medium">
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </span>
              )}
            </div>

            {/* Settings Button (optional) */}
            <div
              onClick={() => navigate("/settings")}
              className={`
                flex items-center cursor-pointer rounded-lg
                text-gray-700 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-mirage-800
                ${isCollapsed ? "justify-center py-3" : "px-3 py-2"}
                transition-all duration-200
              `}
            >
              <Settings size={18} />
              {!isCollapsed && (
                <span className="ml-3 whitespace-nowrap opacity-100 transition-opacity duration-200 font-medium">
                  Settings
                </span>
              )}
            </div>

            {/* Logout Button */}
            <div
              onClick={handleLogout}
              className={`
                flex items-center cursor-pointer rounded-lg mt-2
                text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-mirage-800
                ${isCollapsed ? "justify-center py-3" : "px-3 py-2"}
                transition-all duration-200
              `}
            >
              <LogOut size={18} />
              {!isCollapsed && (
                <span className="ml-3 whitespace-nowrap opacity-100 transition-opacity duration-200 font-medium">
                  Log Out
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Sidebar;