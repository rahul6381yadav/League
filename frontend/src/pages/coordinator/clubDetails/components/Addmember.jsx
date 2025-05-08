import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { backendUrl } from "../../../../utils/routes";
import { 
  Search, 
  Filter, 
  Check, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Users,
  Loader2
} from "lucide-react";

function AddMembers({ alreadyMemberIds = [], onClose }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  
  const token = localStorage.getItem("jwtToken");
  const decodedToken = jwtDecode(token);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/user/profile?role=${roleFilter}&search=${search}`,
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
        showNotification("error", data.message);
      }
    } catch (error) {
      showNotification("error", "Failed to fetch users");
      console.error("Error fetching users:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleRoleFilterChange = (event) => {
    setCurrentPage(1);
    setRoleFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === currentItems.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentItems.map(user => user._id));
    }
  };

  const applyFilters = () => {
    const filtered = users.filter((user) => {
      return (
        (roleFilter === "" || (user.role === roleFilter)) &&
        (search === "" || 
          (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
        ) &&
        !alreadyMemberIds.includes(user._id)
      );
    });
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/v1/club?id=${decodedToken.clubId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberIds: selectedUsers,
        }),
      });
      const data = await response.json();

      if (!data.isError) {
        showNotification("success", "Members added successfully!");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showNotification("error", data.message || "Failed to add members");
      }
    } catch (error) {
      showNotification("error", "An error occurred while adding members");
      console.error("Error submitting data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, [roleFilter]);

  useEffect(() => {
    applyFilters();
  }, [users, roleFilter, search]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if there are fewer than maxPageButtons
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = Math.min(maxPageButtons - 1, totalPages - 1);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPageButtons + 2);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  
  const RoleTag = ({ role }) => {
    const roleStyles = {
      student: "bg-blue-100 text-blue-800",
      coordinator: "bg-purple-100 text-purple-800",
      faculty: "bg-green-100 text-green-800",
      cosa: "bg-orange-100 text-orange-800",
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${roleStyles[role] || "bg-gray-100 text-gray-800"}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="relative">
      {/* Notification */}
      {notification.show && (
        <div 
          className={`absolute top-0 right-0 left-0 mx-auto w-full max-w-md p-4 rounded-md shadow-lg z-50 animate-slide-down flex items-center justify-between
            ${notification.type === "success" ? "bg-green-100 text-green-800 border-l-4 border-green-500" : 
              "bg-red-100 text-red-800 border-l-4 border-red-500"}`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ show: false })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Add Members
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedUsers.length} selected
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Select users to add to your club
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer transition-all"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="coordinator">Coordinator</option>
              <option value="faculty">Faculty</option>
              <option value="cosa">COSA Member</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-3">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="p-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === currentItems.length && currentItems.length > 0}
                          onChange={selectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2">Select</span>
                      </div>
                    </th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Batch</th>
                    <th className="p-3 text-left">Student ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((user) => (
                    <tr 
                      key={user._id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors
                        ${selectedUsers.includes(user._id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleCheckboxChange(user._id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          {selectedUsers.includes(user._id) && (
                            <Check className="h-4 w-4 text-indigo-600 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900 dark:text-gray-200">
                          {user.fullName || "N/A"}
                        </div>
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="p-3">
                        <RoleTag role={user.role} />
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {user.batchCode || "N/A"}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {user.studentId || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredUsers.length)}
            </span>{" "}
            of <span className="font-medium">{filteredUsers.length}</span> results
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 
                ${currentPage === 1 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex">
              {pageNumbers.map((number, index) => (
                <button
                  key={index}
                  onClick={() => typeof number === 'number' && setCurrentPage(number)}
                  disabled={typeof number !== 'number'}
                  className={`
                    inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600
                    ${typeof number !== 'number' 
                      ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300' 
                      : number === currentPage
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 dark:border-indigo-500' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 
                ${currentPage === totalPages 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedUsers.length === 0 || isSubmitting}
          className={`px-4 py-2 rounded-md flex items-center gap-2
            ${selectedUsers.length === 0 || isSubmitting
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? "s" : ""}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AddMembers;