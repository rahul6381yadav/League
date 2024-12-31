// src/components/Attendance.js
import React from 'react';

const Attendance = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Attendance</h2>
            <table className="min-w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border-b">Name</th>
                        <th className="px-4 py-2 border-b">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="px-4 py-2 border-b">John Doe</td>
                        <td className="px-4 py-2 border-b">
                            <input type="checkbox" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Attendance;
