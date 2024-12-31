// src/components/AddMembers.js
import React, { useState } from 'react';

const AddMembers = () => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to add member
        console.log('Member added:', name);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Add Members</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter Member Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border px-4 py-2 rounded-lg mb-4 w-full"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                    Add Member
                </button>
            </form>
        </div>
    );
};

export default AddMembers;
