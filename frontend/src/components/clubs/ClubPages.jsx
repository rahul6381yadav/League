import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import ViewEvents from '../club_page/ViewEvents';

const ClubPages = () => {
    const [isCoordinator, setIsCoordinator] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Added state for modal
    const email = localStorage.getItem("emailCont");
    const location = useLocation();
    const {clubId, clubEmail, clubName} = location.state || {};
    const navigate = useNavigate();

    useEffect(() => {
        const roles = localStorage.getItem('roles');
        setIsCoordinator((roles === "coordinator") && (email === clubEmail));
    }, [email]);

    const handleViewMembers = () => {
        navigate('/Clubs/ClubMember', {state: {primaryClubId: clubId, primaryClubEmail: clubEmail}});
    };

    return (
        <div className="text-gray-900 min-h-screen flex flex-col w-full">
            <div className="p-4 flex-grow w-full">
                <h1 className="text-3xl font-bold text-gray dark:text-white text-center mb-4">{clubName}</h1>
                <div className="flex flex-wrap gap-6">
                    <ViewEvents primaryClubId={clubId}/>
                </div>
            </div>
        </div>
    );
};

export default ClubPages;