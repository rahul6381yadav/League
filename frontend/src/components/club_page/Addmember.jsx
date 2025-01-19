import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
function AddMembers({ alreadyMemberIds = [] }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState("");
    const [batchFilter] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const email = localStorage.getItem("emailCont");
    const token = localStorage.getItem("jwtToken");
    const decodedToken = jwtDecode(token);
    
    const fetchAllUsers = async () => {
        try {
            const response = await fetch(
                `http://localhost:4000/user/profile?role=${roleFilter}&search=${search}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            if (!data.isError) {
                setUsers(data.users);
                setFilteredUsers(data.users.filter(user => !alreadyMemberIds.includes(user._id)));
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching users:", error.message);
        }
    };

    const handleRoleFilterChange = (event) => {
        setCurrentPage(1);
        setRoleFilter(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleCheckboxChange = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const applyFilters = () => {
        const filtered = users.filter((user) => {
            return (
                (roleFilter === "" || (user.role===roleFilter)) &&
                (search === "" || (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase()))) &&
                (batchFilter === "" || (user.batchCode && user.batchCode.toString() === batchFilter.toString())) &&
                !alreadyMemberIds.includes(user._id) // Exclude already members
            );
        });
        setFilteredUsers(filtered);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const handleSubmit = async (selectedUsers) => {
        try {
            // Assuming you're sending the selected user IDs to be added to the club.
            const response = await fetch(`http://localhost:4000/api/v1/club?id=${decodedToken.clubId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    memberIds: selectedUsers, // Send the selected users' IDs
                }),
            });
            console.log(selectedUsers);
            const data = await response.json();

            if (!data.isError) {
                // Handle success, for example by updating the club members state.
                alert("Members added successfully!");
            } else {
                // Handle failure, show an error message.
                alert("Error adding members: " + data.message);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("An error occurred while adding members.");
        }
    };


    useEffect(() => {
        fetchAllUsers();
    }, [email, roleFilter, search]);

    useEffect(() => {
        applyFilters();
    }, [users, roleFilter, search]);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">View Users</h1>
            <div className="flex items-center gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={search}
                    onChange={handleSearchChange}
                    className="p-2 border rounded w-1/3"
                />
                <select
                    value={roleFilter}
                    onChange={handleRoleFilterChange}
                    className="p-2 border rounded w-1/4"
                >
                    <option value="student">Student</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="faculty">Faculty</option>
                    <option value="cosa">COSA Member</option>
                </select>
            </div>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border p-2">Select</th>
                        <th className="border p-2 w-1/6">Full Name</th>
                        <th className="border p-2 w-1/6">Email</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2 w-1/12">Batch Code</th>
                        <th className="border p-2">Student ID</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((user) => (
                        <tr key={user._id}>
                            <td className="border p-2 text-center">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user._id)}
                                    onChange={() => handleCheckboxChange(user._id)}
                                />
                            </td>
                            <td className="border p-2 truncate">{user.fullName}</td>
                            <td className="border p-2 truncate">{user.email}</td>
                            <td className="border p-2">{user.role}</td>
                            <td className="border p-2">{user.batchCode || "N/A"}</td>
                            <td className="border p-2">{user.studentId || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 flex justify-center gap-4">
                {[...Array(totalPages).keys()].map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber + 1)}
                        className={`px-4 py-2 rounded ${currentPage === pageNumber + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                            }`}
                    >
                        {pageNumber + 1}
                    </button>
                ))}
            </div>
            <button
                className={`mt-6 px-6 py-2 rounded ${selectedUsers.length > 0 ? "bg-green-500 text-white" : "bg-gray-300 text-black"
                    }`}
                disabled={selectedUsers.length === 0}
                onClick={() => {
                    console.log(selectedUsers)
                    handleSubmit(selectedUsers)
                }}
            >
                Add Member
            </button>
        </div>
    );
}

export default AddMembers;
