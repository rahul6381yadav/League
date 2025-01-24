import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const AllMember = () => {
    const [users, setUsers] = useState([]); // Full data from API
    const [filteredUsers, setFilteredUsers] = useState([]); // Filtered data
    const [rolesFilter, setRolesFilter] = useState("");
    const [batchFilter, setBatchFilter] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const token = localStorage.getItem("jwtToken");
    const [itemsPerPage] = useState(7);
    const navigate = useNavigate();
    // Fetch all users from the backend
    const fetchAllUsers = async () => {
        try {
            const response = await fetch(
                `http://localhost:4000/user/profile?roles=${rolesFilter}&search=${search}`,
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
                setFilteredUsers(data.users);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.log("Error fetching users: ", error);
        }
    };

    // Handle changes to filters and search input
    const handleSearchChange = (event) => setSearch(event.target.value);
    const handleRoleFilterChange = (event) => setRolesFilter(event.target.value);
    const handleBatchFilterChange = (event) => setBatchFilter(event.target.value);

    // Apply filters to the data
    const applyFilters = () => {
        const filtered = users.filter((user) => {
            return (
                (rolesFilter === "" || (user.role===rolesFilter)) &&
                (search === "" || (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase()))) &&
                (batchFilter === "" || (user.batchCode && user.batchCode.toString() === batchFilter.toString()))
            );
        });
        setFilteredUsers(filtered);
    };

    // Update filtered users whenever filters change
    useEffect(() => {
        applyFilters();
    }, [users, rolesFilter, search, batchFilter]);

    // Fetch data on component mount
    useEffect(() => {
        fetchAllUsers();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <div className="p-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={search}
                    onChange={handleSearchChange}
                    className="border p-2 rounded text-black w-full md:w-1/3"
                />
                <select
                    value={rolesFilter}
                    onChange={handleRoleFilterChange}
                    className="border p-2 text-black rounded w-full md:w-1/3"
                >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="cosa">COSA</option>
                </select>
                <input
                    type="text"
                    placeholder="Batch Code"
                    value={batchFilter}
                    onChange={handleBatchFilterChange}
                    className="border p-2 rounded text-black w-full md:w-1/3"
                />
            </div>

            {/* User Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((user, index) => (
                    <div
                        key={index}
                        className="border rounded p-4 shadow hover:shadow-md text-black transition dark:bg-gray-800 dark:text-white"
                        onClick={() => navigate(`/friends/${user._id}`)}
                    >
                        <img
                            src={user.photo || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                            alt="Profile Avatar"
                            className="w-12 h-12 rounded-full border border-mirage-300 dark:border-mirage-500"
                        />
                        <h3 className="font-bold text-lg">{user.fullName}</h3>
                        <p className="text-sm">Email: {user.email}</p>
                        <p className="text-sm">Role: {user.role}</p>
                        <p className="text-sm">Batch: {user.batchCode}</p>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-4 py-2 mx-1 rounded ${currentPage === pageNumber
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                            }`}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AllMember;
