// Tooltip_sidebar.js
import React from 'react';

const Tooltip = ({children, text, show}) => {
    return (
        <div className="relative group flex items-center">
            {children}
            {show && (
                <div
                    className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-max p-2 text-sm text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;