import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function ViewUsers() {
    const [isCoordinator, setIsCoordinator] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [rolesFilter, setRolesFilter] = useState("");
    const [batchFilter, setBatchFilter] = useState("");
    const [search, setSearch] = useState("");
    const email = localStorage.getItem("emailCont");
    const location = useLocation();
    const token = localStorage.getItem("authToken");
    const { primaryClubId, primaryClubEmail } = location.state || {};

    const fetchAllUsers = async () => {
        try {
            const response = await fetch(`http://localhost:4000/user/profile?roles=${rolesFilter}&search=${search}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!data.isError) {
                setUsers(data.users);
                setFilteredUsers(data.users);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching users:", error.message);
        }
    };

    const handleRoleFilterChange = (event) => {
        setRolesFilter(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const applyFilters = () => {
        const filtered = users.filter((user) => {
            return (
                (rolesFilter === "" || (Array.isArray(user.roles) && user.roles.includes(rolesFilter))) &&
                (search === "" || (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase()))) &&
                (batchFilter === "" || (user.batchCode && user.batchCode.toString() === batchFilter.toString()))
            );
        });
        setFilteredUsers(filtered);
    };
    useEffect(() => {
        const roles = localStorage.getItem("roles");
        setIsCoordinator(roles === "coordinator" && email === primaryClubEmail);
        fetchAllUsers();
    }, [email, rolesFilter, search]);

    useEffect(() => {
        applyFilters();
    }, [users, rolesFilter, search]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-black mb-4">View Users</h1>
            <div className="flex items-center gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={search}
                    onChange={handleSearchChange}
                    className="p-2 border rounded text-black w-1/3"
                />
                <select
                    value={rolesFilter}
                    onChange={handleRoleFilterChange}
                    className="p-2 border text-black rounded w-1/4"
                >
                    <option value=""></option>
                    <option value="student">Student</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="faculty">Faculty</option>
                    <option value="cosa">COSA Member</option>
                </select>
            </div>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border p-2">Photo</th>
                        <th className="border p-2">Full Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2">Batch Code</th>
                        <th className="border p-2">Student ID</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user) => (
                        <tr key={user._id}>
                            <td className="border p-2">
                                <img
                                    src={`http://localhost:4000/uploads/${user.photo}`}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full"
                                />
                            </td>
                            <td className="border p-2">{user.fullName}</td>
                            <td className="border p-2">{user.email}</td>
                            <td className="border p-2">{user.roles ? user.roles.join(", ") : "N/A"}</td>
                            <td className="border p-2">{user.batchCode || "N/A"}</td>
                            <td className="border p-2">{user.studentId || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ViewUsers;
