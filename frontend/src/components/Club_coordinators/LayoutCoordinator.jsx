import Sidebar from "./CoordinatorSidebar"; // Import the Sidebar component
import { useState } from "react";
import { useDarkMode } from "../../context/DarkModeContext"; // Import the dark mode context

const LayoutCoordinator = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar collapse state
    const { isDarkMode, toggleDarkMode } = useDarkMode(); // Access dark mode state and toggle function

    const handleSidebarToggle = (collapsed) => {
        setIsCollapsed(collapsed); // Update the sidebar collapse state
    };

    return (
        <div className={`flex h-screen ${isDarkMode ? "dark" : ""}`}>
            {/* Sidebar */}
            <Sidebar onToggle={handleSidebarToggle} />

            {/* Main Content */}
            <main
                className={`transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"
                    } flex-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100`}
            >
                {/* Top Bar with Dark Mode Toggle */}
                <div className="flex justify-end items-center mb-4">
                    <label
                        htmlFor="darkModeToggle"
                        className="relative inline-block w-14 h-8 cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            id="darkModeToggle"
                            className="peer sr-only"
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                        />
                        <span className="block w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 transition peer-checked:bg-green-500"></span>
                        <span
                            className="absolute top-1 left-1 h-6 w-6 bg-white dark:bg-gray-300 rounded-full transition-all peer-checked:translate-x-6"
                        ></span>
                    </label>
                </div>

                {/* Content */}
                {children}
            </main>
        </div>
    );
};

export default LayoutCoordinator;
