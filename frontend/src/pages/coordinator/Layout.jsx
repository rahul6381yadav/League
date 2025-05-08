import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useDarkMode } from "../../context/ThemeContext";
import ProtectedRoute from "../../utils/ProtectedRoute";
import { Bell, Search, Settings, Moon, Sun, LayoutDashboard, BadgeCent, CalendarPlus, FileText, Pencil } from "lucide-react";
import { useLocation } from "react-router-dom";
import { match } from "path-to-regexp";



const LayoutCoordinator = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();
  const path = location.pathname;
  
  const pageNameMap = {
    "/dashboard": "Coordinator Dashboard",
    "/my-club": "Manage Club Details",
    "/manage-events": "Manage Events",
    "/events/:id": "Manage Events -> Event Details",
    "/events/edit/:id": "Events -> Event Details -> Edit Event",
  };

  const iconMap = {
    "/dashboard": LayoutDashboard,
    "/my-club": BadgeCent,
    "/manage-events": CalendarPlus,
    "/events/:id": FileText,
    "/events/edit/:id": Pencil,
  };

  function getMatchingPath(pathname) {
    for (const pattern in iconMap) {
      const isMatch = match(pattern, { decode: decodeURIComponent });
      if (isMatch(pathname)) {
        return pattern;
      }
    }
    return  "/dashboard"; 
  }

  const matchingPath = getMatchingPath(path);

  const pageName = pageNameMap[matchingPath] || "Page";
  const Icon = iconMap[matchingPath] || LayoutDashboard;

  // Handle scroll effect for the header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  // Mock notifications - in a real app these would come from a context or API
  useEffect(() => {
    setNotifications([
      { id: 1, title: "New event added", time: "5 min ago" },
      { id: 2, title: "Student request pending", time: "1 hour ago" },
      { id: 3, title: "Faculty meeting reminder", time: "Yesterday" },
    ]);
  }, []);

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <Sidebar onToggle={handleSidebarToggle} />

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? "md:ml-16" : "md:ml-56"
        }`}
      >
        {/* Header */}
        <header 
          className={` px-4 py-2 flex items-center justify-between transition-all duration-300
            ${scrolled 
              ? "bg-white/90 dark:bg-mirage-900/90 shadow-md backdrop-blur-sm" 
              : "bg-white dark:bg-mirage-900"}`}
        >
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <Icon className="w-5 h-5 text-indigo-500" />
            <div className="hidden md:block">
                <h1 className="text-md font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {pageName}
                </h1>
            </div>
            </div>

          
          {/* Right section - actions */}
          <div className="flex items-center space-x-2">
            {/* Search bar */}
            <div className={`relative ${searchOpen ? "w-64" : "w-8"} transition-all duration-300`}>
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-1.5 rounded-full ${
                  searchOpen ? "bg-indigo-100 dark:bg-mirage-700" : "hover:bg-indigo-50 dark:hover:bg-mirage-700"
                } transition-colors`}
              >
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
              
              {searchOpen && (
                <input
                  type="text"
                  placeholder="Search..."
                  className="absolute left-0 top-0 w-full h-full pl-8 pr-4 rounded-full border border-indigo-100 dark:border-mirage-700 bg-white dark:bg-mirage-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 text-sm transition-all duration-300"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
              )}
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-mirage-700 transition-colors relative"
              >
                <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              
              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-mirage-800 rounded-lg shadow-lg border border-indigo-50 dark:border-mirage-700 z-50">
                  <div className="p-3 border-b border-indigo-50 dark:border-mirage-700">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Notifications</h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-3 border-b border-indigo-50 dark:border-mirage-700 hover:bg-indigo-50 dark:hover:bg-mirage-700 transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center">
                    <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Settings */}
            <button className="p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-mirage-700 transition-colors">
              <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* Dark mode toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-mirage-700 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>
            
            {/* User avatar */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center cursor-pointer transform transition-transform hover:scale-105">
              <span className="text-xs font-medium text-white">JD</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-mirage-950 transition-colors duration-300">
          <div className="container mx-auto p-4">
            {/* Decorative elements */}
            <div className="absolute top-20 right-10 w-64 h-64 bg-indigo-500 rounded-full opacity-5"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500 rounded-full opacity-5"></div>
            
            {/* Light streaks */}
            <div className="absolute top-0 left-1/3 w-1 h-full bg-gradient-to-b from-transparent via-purple-300 to-transparent opacity-10"></div>
            <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-blue-300 to-transparent opacity-10"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <ProtectedRoute requiredRole="coordinator">{children}</ProtectedRoute>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-2 px-4 bg-white dark:bg-mirage-900 border-t border-indigo-50 dark:border-mirage-700 text-xs text-gray-500 dark:text-gray-400 text-center">
          League of IIITR © {new Date().getFullYear()} - Coordinator Dashboard
        </footer>
      </div>
    </div>
  );
};

export default LayoutCoordinator;