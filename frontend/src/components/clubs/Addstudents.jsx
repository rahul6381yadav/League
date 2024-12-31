import React, { useState } from 'react';

const AddStudentMembers = () => {
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to add student member
        console.log('Student added:', studentName, studentEmail);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Add Student Members</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter Student Name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="border px-4 py-2 rounded-lg mb-4 w-full"
                />
                <input
                    type="email"
                    placeholder="Enter Student Email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="border px-4 py-2 rounded-lg mb-4 w-full"
                />
                <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                >
                    Add Student
                </button>
            </form>
        </div>
    );
};

export default AddStudentMembers;
