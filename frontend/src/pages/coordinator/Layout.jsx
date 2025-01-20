import Sidebar from "./Sidebar";
import { useState } from "react";
import { useDarkMode } from "../../context/ThemeContext";
import { FaBell, FaMoon, FaSun, FaUser } from "react-icons/fa";
import ProtectedRoute from "../../utils/ProtectedRoute";

const LayoutCoordinator = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    const handleSidebarToggle = (collapsed) => {
        setIsCollapsed(collapsed);
    };

    const renderIcon = (currentTheme) => {
        if (currentTheme === "dark") {
            return <FaSun />;
        }
        return <FaMoon className="text-mirage-100" />;
    };

    return (
        <div className={`flex ${isDarkMode ? "dark" : ""}`}>
            {/* Sidebar */}
            <Sidebar onToggle={handleSidebarToggle} />

            {/* Main Content */}
            <main
                className={`transition-all duration-300 ml-0 ${
                    isCollapsed ? "md:ml-16 lg:ml-16" : "md:ml-64 lg:ml-64"
                } flex-1 dark:bg-mirage-900 text-mirage-900 dark:text-mirage-50`}
            >
                {/* Top bar with Dark Mode Toggle */}
                <header className="w-full bg-mirage-50 dark:bg-mirage-800 shadow-md">
                    <div className="flex items-center justify-between px-4 py-3 md:px-6">
                        <div className="flex items-center gap-4"></div>

                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => {
                                    toggleDarkMode();
                                }}
                                className="bg-transparent flex items-center justify-center"
                            >
                                {renderIcon(isDarkMode ? "dark" : "light")}
                            </button>

                            <a href={"/notifications"}>
                                <FaBell className="text-mirage-900 dark:text-mirage-100 cursor-pointer text-xl" />
                            </a>

                            <a href={"/profile"}>
                                <FaUser className="text-mirage-900 dark:text-mirage-100 cursor-pointer text-xl" />
                            </a>
                        </div>
                    </div>
                </header>

                <ProtectedRoute requiredRole="coordinator">{children}</ProtectedRoute>
            </main>
        </div>
    );
};

export default LayoutCoordinator;
