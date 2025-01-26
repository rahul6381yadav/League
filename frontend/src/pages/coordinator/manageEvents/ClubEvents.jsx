import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import ViewEvents from './components/ViewEvents';

const ClubEvents = () => {
    const [isCoordinator, setIsCoordinator] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Added state for modal
    const location = useLocation();
    const {clubId,clubName} = location.state || {};



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

export default ClubEvents;