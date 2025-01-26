import Sidebar from "./Sidebar";
import { useState } from "react";
import { useDarkMode } from "../../context/ThemeContext";
import ProtectedRoute from "../../utils/ProtectedRoute";
import Topbar from "../common/topbar";

const LayoutCoordinator = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

    return (
        <div className={`flex ${isDarkMode ? "dark" : ""}`}>
            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isMobileOpen} toggleMobileSidebar={toggleMobileSidebar} />

            {/* Main Content */}
            <main
                className={`transition-all duration-300 ml-0 ${
                    isCollapsed ? "md:ml-16 lg:ml-16" : "md:ml-64 lg:ml-64"
                } flex-1 dark:bg-mirage-900 text-mirage-900 dark:text-mirage-50`}
            >
                {/* <Topbar toggleDarkMode={toggleDarkMode} toggleMobileSidebar={setIsCollapsed} selectedTab={"Dashboard"} isDarkMode={isDarkMode}></Topbar> */}
                <ProtectedRoute requiredRole="coordinator">{children}</ProtectedRoute>
            </main>
        </div>
    );
};

export default LayoutCoordinator;