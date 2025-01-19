import React from 'react';
import {FaArrowLeft, FaArrowRight} from 'react-icons/fa';

const Pagination = ({pagination, setPagination}) => {
    const handleNext = () => setPagination({...pagination, skip: pagination.skip + pagination.limit});
    const handlePrev = () => setPagination({...pagination, skip: Math.max(0, pagination.skip - pagination.limit)});

    return (
        <div className="flex justify-between mt-4">
            <button
                onClick={handlePrev}
                disabled={pagination.skip === 0}
                className="p-2 bg-gray-200 rounded flex items-center space-x-1"
            >
                <FaArrowLeft/>
                <footer>Previous</footer>
            </button>
            <button onClick={handleNext} className="p-2 bg-gray-200 rounded flex items-center space-x-1">
                <FaArrowRight/>
                <footer>Next</footer>
            </button>
        </div>
    );
};

export default Pagination;
