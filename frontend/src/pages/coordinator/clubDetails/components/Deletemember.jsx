import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

function DeleteMembers({ members = [] }) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const token = localStorage.getItem("jwtToken");
    const decodedToken = jwtDecode(token);
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    useEffect(() => {
        console.log("members of the club ", members);
    }, [members]);

    const handleCheckboxChange = (memberId) => {
        setSelectedMembers((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/v1/club?id=${decodedToken.clubId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    removeMemberIds: selectedMembers, // Send the selected users' IDs
                }),
            });

            const data = await response.json();
            console.log(data);
            if (!data.isError) {
                alert("Members deleted successfully!");
            } else {
                alert("Error deleting members: " + data.message);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("An error occurred while deleting members.");
        }
    };

    const filteredMembers = members.filter((member) => {
        if (!member.fullName) {
            return true;
        }
        return member.fullName.toLowerCase().includes(search.toLowerCase());
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-mirage-700 dark:text-white ">Delete Members</h1>
            <div className="flex items-center gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={search}
                    onChange={handleSearchChange}
                    className="p-2 border rounded w-1/3 bg-mirage-100 dark:bg-mirage-700 text-mirage-50 border-mirage-300"
                />
            </div>
            <table className="w-full border-collapse border border-mirage-300">
                <thead>
                <tr>
                    <th className="border p-2">Select</th>
                    <th className="border p-2 w-1/3">Full Name</th>
                    <th className="border p-2 w-1/3">Email</th>
                    <th className="border p-2 w-1/4">Role</th>
                    <th className="border p-2 w-1/4">Batch Code</th>
                    <th className="border p-2 w-1/4">Student ID</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.length === 0 ? (
                    <tr>
                        <td colSpan="3" className="text-center p-4">
                            No members found.
                        </td>
                    </tr>
                ) : (
                    currentItems.map((member) => (
                        <tr key={member._id}>
                            <td className="border p-2 text-center">
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(member._id)}
                                    onChange={() => handleCheckboxChange(member._id)}
                                    className="bg-mirage-100"
                                />
                            </td>
                            <td className="border p-2 truncate">{member.fullName || "N/A"}</td>
                            <td className="border p-2 truncate">{member.email || "N/A"}</td>
                            <td className="border p-2">{member.role || "N/A"}</td>
                            <td className="border p-2">{member.batchCode || "N/A"}</td>
                            <td className="border p-2">{member.studentId || "N/A"}</td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
            <div className="mt-4 flex justify-center gap-4">
                {[...Array(totalPages).keys()].map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber + 1)}
                        className={`px-4 py-2 rounded ${currentPage === pageNumber + 1 ? "bg-mirage-500 text-white" : "bg-mirage-200 text-black"}`}
                    >
                        {pageNumber + 1}
                    </button>
                ))}
            </div>
            <button
                className={`mt-6 px-6 py-2 rounded ${selectedMembers.length > 0 ? "bg-mirage-600 text-white" : "bg-mirage-300 text-black"}`}
                disabled={selectedMembers.length === 0}
                onClick={handleDelete}
            >
                Delete Selected Members
            </button>
        </div>
    );
}

export default DeleteMembers;
