import Sidebar from "./Sidebar";
import { useState } from "react";
import { useDarkMode } from "../../context/ThemeContext";
import ProtectedRoute from "../../utils/ProtectedRoute";

const LayoutCoordinator = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isDarkMode } = useDarkMode();

    const handleSidebarToggle = (collapsed) => {
        setIsCollapsed(collapsed);
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
                <ProtectedRoute requiredRole="coordinator">{children}</ProtectedRoute>
            </main>
        </div>
    );
};

export default LayoutCoordinator;