import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from '../../context/AuthContext';
const HomePage = () => {
    const { setIsAuthenticated } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(
        window.matchMedia("(prefers-color-scheme: dark)").matches // Default to system preference
    );

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <main className=" ml-20 flex-1 p-2 text-gray-800 dark:text-white">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
                    {/* Dark Mode Toggle */}
                    <label
                        htmlFor="darkModeToggle"
                        className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] peer-checked:bg-green-500"
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
                <p className="mt-4">
                    Here you can toggle between light and dark mode and explore the menu.
                </p>
            </main>
        </div>
    );
};

export default HomePage;
