import React, { useState } from "react";

const Pagination = ({ totalPages, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePrevClick = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange && onPageChange(newPage); // Notify parent if provided
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange && onPageChange(newPage); // Notify parent if provided
    }
  };

  return (
    <div className="flex items-center space-x-4 mt-4 justify-center">
      {/* Previous Button */}
      <button
        onClick={handlePrevClick}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded border 
          ${currentPage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer border-gray-200 bg-white"}
          text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
      >
        Previous
      </button>

      {/* Current Page Info */}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded border 
          ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : "cursor-pointer border-gray-200 bg-white"}
          text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
