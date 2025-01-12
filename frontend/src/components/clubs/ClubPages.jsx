import React, { useState, useEffect } from 'react';
import CreateEvents from '../club_page/CreateEvents';
import AddMembers from '../club_page/Addmember';
import AddStudentMembers from '../club_page/Addstudents';
import { useLocation, useNavigate } from 'react-router-dom';
import ViewEvents from '../club_page/ViewEvents';
import { FaPlus } from 'react-icons/fa';

const ClubPages = () => {
    const [isCoordinator, setIsCoordinator] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Added state for modal
    const email = localStorage.getItem("emailCont");
    const location = useLocation();
    const { clubId, clubEmail, clubName } = location.state || {};
    const navigate = useNavigate();

    useEffect(() => {
        const roles = localStorage.getItem('roles');
        setIsCoordinator((roles === "coordinator") && (email === clubEmail));
    }, [email]);

    const handleViewMembers = () => {
        navigate('/Clubs/ClubMember', { state: { primaryClubId: clubId, primaryClubEmail: clubEmail } });
    };

    return (
        <div className="text-gray-900 min-h-screen flex flex-col w-full">
            <div className="p-4 flex-grow w-full">
                <h1 className="text-3xl font-bold text-gray dark:text-white text-center mb-4">{clubName}</h1>
                <div className="text-right mb-4">
                    <a
                        className="text-xl font-bold text-blue-600 bg-white cursor-pointer"
                        onClick={handleViewMembers}
                    >
                        View all Club members
                    </a>
                </div>
                {isCoordinator && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mb-4 p-2 bg-green-500 text-white rounded flex items-center space-x-2 shadow-md hover:bg-green-600 transition"
                    >
                        <FaPlus />
                        <span>Create Event</span>
                    </button>
                )}
                <div className="flex flex-wrap gap-6">
                    <ViewEvents primaryClubId={clubId} />
                </div>
                {isCoordinator && (
                    <>
                        <CreateEvents primaryClubId={clubId} primaryClubName={clubName} />
                        <AddMembers />
                        <AddStudentMembers />
                    </>
                )}
            </div>
        </div>
    );
};

export default ClubPages;