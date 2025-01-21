import Sidebar from "./Sidebar";
import { useState } from "react";
import { useDarkMode } from "../../context/ThemeContext";
import ProtectedRoute from "../../utils/ProtectedRoute";

const Layout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isDarkMode } = useDarkMode();

    const handleSidebarToggle = (collapsed) => {
        setIsCollapsed(collapsed);
    };

    return (
        <div className={`flex ${isDarkMode ? "dark" : ""}`}>
            <Sidebar onToggle={handleSidebarToggle} />
            <main
                className={`transition-all duration-300 ml-0 ${
                    isCollapsed ? "md:ml-16 lg:ml-16" : "md:ml-64 lg:ml-64"
                } flex-1 dark:bg-mirage-900 text-mirage-100 dark:text-mirage-50`}
            >
                <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>
            </main>
        </div>
    );
};

export default Layout;