import React, { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import AddMembers from "./components/Addmember";
import DeleteMembers from "./components/Deletemember";
import { backendUrl } from '../../../utils/routes';
function MyClub() {
    const [clubDetails, setClubDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const token = localStorage.getItem("jwtToken");
    const decodedToken = jwtDecode(token);
    const [memberandCoordinatorIds, setMemberAndCoordinatorIds] = useState([]);
    const [memberIds, setMemberIds] = useState([]);

    const fetchClubDetails = async () => {
        try {
            if (!token) {
                console.error("No auth token found. Please log in.");
                return;
            }
            console.log(decodedToken.clubId);
            const response = await fetch(
                `${backendUrl}/api/v1/club?id=${decodedToken.clubId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const result = await response.json();

            if (response.ok) {
                setClubDetails(result.club);
                let ids = [];
                if (result.club && result.club.members && result.club.members.length > 0) {
                    ids = result.club.members.map((member) => member._id);
                    setMemberIds(ids);
                }
                console.log("members ids ", ids);
                let ids2 = [];
                if (result.club && result.club.coordinator1) {
                    ids2.push(result.club.coordinator1._id);
                }
                if (result.club && result.club.coordinator2) {
                    ids2.push(result.club.coordinator2._id);
                }
                setMemberAndCoordinatorIds([...ids, ...ids2]);
                console.log("coordinator ids ", ids2);
            } else {
                console.log("Error in response");
            }
        } catch (error) {
            console.error("Error fetching club details:", error);
        }
    };

    useEffect(() => {
        fetchClubDetails();
    }, []);

    if (!clubDetails) {
        return (
            <div className="container mx-auto p-6 min-h-screen flex flex-col">
                <h1 className="text-2xl font-bold mb-6 text-mirage-800 dark:text-mirage-50">
                    My Club
                </h1>
                <p className="text-mirage-600 dark:text-mirage-400">
                    No club details available.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 min-h-screen flex flex-col">
            <h1 className="text-2xl font-bold mb-6 text-mirage-800 dark:text-mirage-50">
                My Club
            </h1>
            <div className="bg-mirage-200 dark:bg-mirage-800 shadow-md rounded-lg p-6 mb-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <img
                            src={clubDetails.image || "/placeholder-image.png"}
                            alt={clubDetails.name}
                            className="w-24 h-24 rounded-full border-2 bg-mirage-400 dark:bg-mirage-800 border-mirage-300 dark:border-mirage-600 object-cover"
                        />
                        <div className="ml-4">
                            <h2 className="text-xl font-semibold text-mirage-800 dark:text-mirage-50">
                                {clubDetails.name}
                            </h2>
                            <p className="text-mirage-600 dark:text-mirage-400">
                                {clubDetails.description || "No description available."}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="bg-mirage-400 dark:bg-mirage-700 text-mirage-50 px-4 py-2 rounded hover:bg-mirage-600 dark:hover:bg-mirage-700"
                            onClick={() => console.log("Edit club details clicked")}
                        >
                            Edit Club Details
                        </button>
                        <button
                            className="bg-mirage-400 dark:bg-mirage-700 text-mirage-50 px-4 py-2 rounded hover:bg-mirage-500 dark:hover:bg-mirage-600"
                            onClick={() => {
                                setIsModalOpen(true);
                                console.log("Add member clicked");
                            }}
                        >
                            Add Member
                        </button>
                        <button
                            className="bg-mirage-400 dark:bg-mirage-700 text-mirage-50 px-4 py-2 rounded hover:bg-mirage-800 dark:hover:bg-mirage-900"
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            Delete Member
                        </button>
                        <button
                            className="bg-mirage-400 dark:bg-mirage-700 text-mirage-50 px-4 py-2 rounded hover:bg-mirage-700 dark:hover:bg-mirage-800"
                            onClick={() => console.log("Add student member clicked")}
                        >
                            Add Student Member
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-medium text-lg text-mirage-800 dark:text-mirage-50">
                            Coordinators
                        </h3>
                        <ul className="list-disc ml-6 text-mirage-700 dark:text-mirage-300">
                            <li>{(clubDetails.coordinator1 && clubDetails.coordinator1.email) || "Coordinator 1 not assigned"}</li>
                            <li>{(clubDetails.coordinator2 && clubDetails.coordinator2.email) || "Coordinator 2 not assigned"}</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium text-lg text-mirage-800 dark:text-mirage-50">
                            Email
                        </h3>
                        <p className="text-mirage-700 dark:text-mirage-300">
                            {clubDetails.email}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium text-lg text-mirage-800 dark:text-mirage-50">
                            Overall Rating
                        </h3>
                        <p className="text-mirage-700 dark:text-mirage-300">
                            {clubDetails.overallRating || 0}
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-medium text-lg text-mirage-800 dark:text-mirage-50 mb-2">
                        Members
                    </h3>
                    {clubDetails.members && clubDetails.members.length > 0 ? (
                        <ul className="list-disc ml-6 text-mirage-700 dark:text-mirage-300">
                            {clubDetails.members.map((member) => (
                                <li key={member._id}>{member.email}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-mirage-500 dark:text-mirage-400">No members yet.</p>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="font-medium text-lg text-mirage-800 dark:text-mirage-50 mb-2">
                        Student Members
                    </h3>
                    {clubDetails.studentMembers && clubDetails.studentMembers.length > 0 ? (
                        <ul className="list-disc ml-6 text-mirage-700 dark:text-mirage-300">
                            {clubDetails.studentMembers.map((student) => (
                                <li key={student}>{student}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-mirage-500 dark:text-mirage-400">
                            No student members yet.
                        </p>
                    )}
                </div>

                {/*<div className="flex flex-wrap gap-4 mt-6">*/}
                {/*    <button*/}
                {/*        className="bg-mirage-400 dark:bg-mirage-700 text-mirage-50 px-4 py-2 rounded hover:bg-mirage-600 dark:hover:bg-mirage-700"*/}
                {/*        onClick={() => console.log("Edit club details clicked")}*/}
                {/*    >*/}
                {/*        Edit Club Details*/}
                {/*    </button>*/}
                {/*    <button*/}
                {/*        className="bg-mirage-400 dark:bg-mirage-700 text-mirage-50 px-4 py-2 rounded hover:bg-mirage-500 dark:hover:bg-mirage-600"*/}
                {/*        onClick={() => {*/}
                {/*            setIsModalOpen(true);*/}
                {/*            console.log("Add member clicked")*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        Add Member*/}
                {/*    </button>*/}
                {/*    <button*/}
                {/*        className="bg-mirage-400 dark:bg-mirage-700 text-mirage-50 px-4 py-2 rounded hover:bg-mirage-800 dark:hover:bg-mirage-900"*/}
                {/*        onClick={() => setIsDeleteModalOpen(true)}*/}
                {/*    >*/}
                {/*        Delete Member*/}
                {/*    </button>*/}
                {/*    <button*/}
                {/*        className="bg-mirage-400 dark:bg-mirage-700 text-mirage-50 px-4 py-2 rounded hover:bg-mirage-700 dark:hover:bg-mirage-800"*/}
                {/*        onClick={() => console.log("Add student member clicked")}*/}
                {/*    >*/}
                {/*        Add Student Member*/}
                {/*    </button>*/}
                {/*</div>*/}

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div
                            className="bg-black opacity-50 absolute inset-0"
                            onClick={() => setIsModalOpen(false)}
                        ></div>
                        <div
                            className="bg-mirage-200 dark:bg-mirage-800 rounded-lg shadow-lg z-10 p-3 w-full h-full max-h-[90vh] overflow-y-auto">
                            <AddMembers
                                alreadyMemberIds={memberandCoordinatorIds}
                                onClose={() => {
                                    setIsModalOpen(false);
                                    fetchClubDetails();
                                }}
                            />
                        </div>
                    </div>
                )}

                {isDeleteModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div
                            className="bg-black opacity-50 absolute inset-0"
                            onClick={() => setIsDeleteModalOpen(false)}
                        ></div>
                        <div
                            className="bg-mirage-200 dark:bg-mirage-800 rounded-lg shadow-lg z-10 p-3 w-full h-full max-h-[90vh] overflow-y-auto">
                            <DeleteMembers
                                members={clubDetails.members}
                                onClose={() => {
                                    setIsDeleteModalOpen(false);
                                    fetchClubDetails();
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyClub;
