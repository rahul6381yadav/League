'use client';

import {  FaMoon, FaSun } from "react-icons/fa";
import { FiMenu, } from "react-icons/fi";


const Topbar = ({ toggleMobileSidebar, selectedTab, toggleDarkMode,isDarkMode  }) => {
  return (
    <header className="bg-white w-full dark:bg-gray-800 shadow-md">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">

        <div className="flex items-center gap-4">
          <FiMenu
            className="text-gray-800 dark:text-gray-100 cursor-pointer text-2xl md:hidden"
            onClick={toggleMobileSidebar}
          />
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {selectedTab}
          </h1>
        </div>

        <div className="flex items-center gap-8">
        <div
              className="ml-3 flex items-center p-2 mb-2 hover:bg-mirage-300 dark:hover:bg-mirage-700 rounded cursor-pointer"
              onClick={toggleDarkMode}
          >
                  {isDarkMode ? (
                          <FaMoon className="h-6 w-6 text-mirage-50" />

                  ) : (
                      <FaSun className="h-6 w-6" />
                  )}
             
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
