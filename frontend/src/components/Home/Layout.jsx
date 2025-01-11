import Sidebar from "./StudentSidebar";
import { useState } from "react";
import { useDarkMode } from '../../context/DarkModeContext'; // Import the dark mode context

const Layout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isDarkMode, toggleDarkMode } = useDarkMode(); // Access dark mode state and toggle function

    const handleSidebarToggle = (collapsed) => {
        setIsCollapsed(collapsed);
    };

    return (
        <div className={`flex ${isDarkMode ? "dark" : ""}`}>
            <Sidebar onToggle={handleSidebarToggle} />
            <main
                className={`transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"
                    } p-4 flex-1  dark:bg-gray-900 text-gray-800 dark:text-gray-100`}
            >
                {/* Top bar with Dark Mode Toggle */}
                <div className="flex justify-end items-center mb-4">
                    <label
                        htmlFor="darkModeToggle"
                        className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition peer-checked:bg-green-500"
                    >
                        <input
                            type="checkbox"
                            id="darkModeToggle"
                            className="peer sr-only"
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                        />
                        <span
                            className="absolute inset-y-0 start-0 m-1 w-6 h-6 rounded-full bg-white transition-all peer-checked:start-6"
                        ></span>
                    </label>
                </div>

                {children}
            </main>
        </div>
    );
};

export default Layout;
