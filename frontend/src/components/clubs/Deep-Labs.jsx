import React, { useState, useEffect } from 'react';
import CreateEvents from '../club_page/CreateEvents';
import AddMembers from '../club_page/Addmember';
import { useLocation } from 'react-router-dom';
import AddStudentMembers from '../club_page/Addstudents';
import ViewEvents from '../club_page/ViewEvents';

const DeepLabs = () => {
    const [isCoordinator, setIsCoordinator] = useState(false);
    const email = localStorage.getItem("emailCont");
    const location = useLocation();
    const { clubId, clubEmail } = location.state || {};
    useEffect(() => {
        const roles = localStorage.getItem('roles');
        setIsCoordinator((roles === "coordinator") && (email === clubEmail));
    }, [email]);
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-black text-center">Deep Labs</h1>
            <div className="space-y-6">
                {isCoordinator && <CreateEvents club={"Deep-Labs"} />}
                {isCoordinator && <AddMembers />}
                {isCoordinator && <AddStudentMembers />}
                <ViewEvents primaryClubId={clubId} />

            </div>
        </div>
    );
};

export default DeepLabs;
