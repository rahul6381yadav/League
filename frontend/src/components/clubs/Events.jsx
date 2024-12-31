// src/components/Events.js
import React from 'react';

const Events = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
            <ul>
                <li className="mb-2">
                    <p className="font-semibold">Event 1</p>
                    <p className="text-sm text-gray-600">Date: 2024-01-01</p>
                </li>
                <li className="mb-2">
                    <p className="font-semibold">Event 2</p>
                    <p className="text-sm text-gray-600">Date: 2024-01-15</p>
                </li>
            </ul>
        </div>
    );
};

export default Events;
