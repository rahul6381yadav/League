// React Component
import React, { useState } from "react";

const AdminPanel = () => {
    const [users, setUsers] = useState([
        {
            fullName: "",
            studentId: "",
            email: "",
            password: "",
            batchCode: "",
            roles: "student",
            resetOtp: "",
            resetOtpExpiry: "",
        },
    ]);

    const batchCodeEnum = [19, 20, 21, 22, 23, 24, 25, 26, 27];
    const rolesEnum = ["student", "coordinator", "admin", "cosa", "faculty"];

    const addRow = () => {
        setUsers([
            ...users,
            {
                fullName: "",
                studentId: "",
                email: "",
                password: "",
                batchCode: "",
                roles: "student",
                resetOtp: "",
                resetOtpExpiry: "",
            },
        ]);
    };

    const removeRow = (index) => {
        const updatedUsers = users.filter((_, i) => i !== index);
        setUsers(updatedUsers);
    };

    const handleChange = (index, field, value) => {
        const updatedUsers = [...users];
        updatedUsers[index][field] = value;
        setUsers(updatedUsers);
    };

    const handleRoleChange = (index, role) => {
        const updatedUsers = [...users];
        updatedUsers[index].roles = role;
        setUsers(updatedUsers);
    };

    const handleSubmit = async () => {
        try {
            const promises = users.map(async (user) => {
                const response = await fetch("http://localhost:4000/user/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(user),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to add user");
                }
                return response.json();
            });
            await Promise.all(promises);

            alert("All users added successfully!");
            setUsers([
                {
                    fullName: "",
                    studentId: "",
                    email: "",
                    password: "",
                    batchCode: "",
                    roles: "student",
                    resetOtp: "",
                    resetOtpExpiry: "",
                },
            ]);
        } catch (error) {
            console.error("Error:", error.message);
            alert("Error adding users: " + error.message);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl text-black font-bold mb-4">Admin Panel - Manage Users</h1>
            <table className="min-w-full text-black bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border">Full Name</th>
                        <th className="px-4 py-2 border">Student ID</th>
                        <th className="px-4 py-2 border">Email</th>
                        <th className="px-4 py-2 border">Password</th>
                        <th className="px-4 py-2 border">Batch Code</th>
                        <th className="px-4 py-2 border">Roles</th>
                        <th className="px-4 py-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td className="px-4 py-2 border">
                                <input
                                    type="text"
                                    value={user.fullName}
                                    placeholder="Enter full name"
                                    onChange={(e) =>
                                        handleChange(index, "fullName", e.target.value)
                                    }
                                    className="w-full text-black  px-2 py-1 border rounded"
                                />
                            </td>
                            <td className="px-4 py-2 border">
                                <input
                                    type="text"
                                    value={user.studentId}
                                    placeholder="Enter student Id"
                                    onChange={(e) =>
                                        handleChange(index, "studentId", e.target.value)
                                    }
                                    className="w-full text-black px-2 py-1 border rounded"
                                />
                            </td>
                            <td className="px-4 py-2 border">
                                <input
                                    type="email"
                                    value={user.email}
                                    placeholder="Enter Email"
                                    onChange={(e) => handleChange(index, "email", e.target.value)}
                                    className="w-full text-black px-2 py-1 border rounded"
                                />
                            </td>
                            <td className="px-4 py-2 border">
                                <input
                                    type="password"
                                    value={user.password}
                                    placeholder="Enter Password"
                                    onChange={(e) =>
                                        handleChange(index, "password", e.target.value)
                                    }
                                    className="w-full text-black px-2 py-1 border rounded"
                                />
                            </td>
                            <td className="px-4 py-2 border">
                                <select
                                    value={user.batchCode}
                                    placeholder="Enter Batch code"
                                    onChange={(e) =>
                                        handleChange(index, "batchCode", e.target.value)
                                    }
                                    className="w-full text-black px-2 py-1 border rounded"
                                >
                                    <option value="">Select</option>
                                    {batchCodeEnum.map((code) => (
                                        <option key={code} value={code}>
                                            {code}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-4 py-2 border">
                                {rolesEnum.map((role) => (
                                    <label key={role} className="block">
                                        <input
                                            type="radio"
                                            name={`roles-${index}`}
                                            value={role}
                                            checked={user.roles === role}
                                            onChange={() => handleRoleChange(index, role)}
                                            className="mr-2"
                                        />
                                        {role}
                                    </label>
                                ))}
                            </td>
                            <td className="px-4 py-2 border text-center">
                                <button
                                    onClick={() => removeRow(index)}
                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4">
                <button
                    onClick={addRow}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                >
                    Add Row
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;
