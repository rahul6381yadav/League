import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Pagination = ({ pagination, setPagination }) => {
    const handleNext = () => setPagination({ ...pagination, skip: pagination.skip + pagination.limit });
    const handlePrev = () => setPagination({ ...pagination, skip: Math.max(0, pagination.skip - pagination.limit) });

    return (
        <div className="flex justify-between mt-4">
            <button
                onClick={handlePrev}
                disabled={pagination.skip === 0}
                className="p-2 bg-mirage-200 dark:bg-mirage-700 text-mirage-800 dark:text-mirage-50 rounded flex items-center space-x-1 hover:bg-mirage-300 dark:hover:bg-mirage-600 transition"
            >
                <FaArrowLeft />
                <footer>Previous</footer>
            </button>
            <button
                onClick={handleNext}
                className="p-2 bg-mirage-200 dark:bg-mirage-700 text-mirage-800 dark:text-mirage-50 rounded flex items-center space-x-1 hover:bg-mirage-300 dark:hover:bg-mirage-600 transition"
            >
                <FaArrowRight />
                <footer>Next</footer>
            </button>
        </div>
    );
};

export default Pagination;
