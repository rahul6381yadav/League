import React, { useState, useEffect } from 'react';
import CreateEvents from '../club_page/CreateEvents';
import AddMembers from '../club_page/Addmember';
import AddStudentMembers from '../club_page/Addstudents';
import { useLocation, useNavigate } from 'react-router-dom';
import ViewEvents from '../club_page/ViewEvents';
const ClubPages = () => {
    const [isCoordinator, setIsCoordinator] = useState(false);
    const email = localStorage.getItem("emailCont");
    const location = useLocation();
    const { clubId, clubEmail , clubName } = location.state || {};
    const navigate = useNavigate();
    useEffect(() => {
            const roles = localStorage.getItem('roles');
            setIsCoordinator((roles === "coordinator") && (email === clubEmail));
    }, [email]);
    const handleViewMembers = () => {
        navigate('/Clubs/ClubMember', { state: { primaryClubId: clubId, primaryClubEmail: clubEmail } });
    };
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-black text-center">{clubName}</h1>
            <div className="space-y-6">
                <div className="text-right" >
                    <a
                        className="text-xl font-bold text-blue-600  bg-white cursor-pointer"
                        onClick={handleViewMembers}
                    >
                        View all Club members
                    </a>
                </div>
                {isCoordinator && <CreateEvents primaryClubId={clubId} primaryClubName={"Codesoc"} />}
                {isCoordinator && <AddMembers />}
                {isCoordinator && <AddStudentMembers />}
                <ViewEvents primaryClubId={clubId} />

            </div>
        </div>
    );
}
export default ClubPages;