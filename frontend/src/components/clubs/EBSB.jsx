import React, { useState, useEffect } from 'react';
import CreateEvents from '../club_page/CreateEvents';
import AddMembers from '../club_page/Addmember';
import AddStudentMembers from '../club_page/Addstudents';
import { useLocation } from 'react-router-dom';

const EBSB = () => {
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
            <h1 className="text-3xl font-bold text-black text-center">Ek Bharat Shrestra Bharat</h1>
            <div className="space-y-6">
                {isCoordinator && <CreateEvents club={"EBSE"} />}
                {isCoordinator && <AddMembers />}
                {isCoordinator && <AddStudentMembers />}

            </div>
        </div>
    );
};

export default EBSB;
