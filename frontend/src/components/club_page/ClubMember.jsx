import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation} from 'react-router-dom';
function ClubMembers(props) {
    const [isCoordinator, setIsCoordinator] = useState(false);
    const email = localStorage.getItem("emailCont");
    const location = useLocation();
    const navigate = useNavigate();
    const { primaryClubId, primaryClubEmail } = location.state || {};
        useEffect(() => {
            const roles = localStorage.getItem('roles');
            setIsCoordinator((roles === "coordinator") && (email === primaryClubEmail));
        }, [email]);
    const handleAllUsers = () => {
        navigate("/ViewUsers", { state: { primaryClubId,primaryClubEmail} });
    };
    return (<>
        {isCoordinator && <div className="text-right" >
            <a
                className="text-xl font-bold text-blue-600  bg-white cursor-pointer"
                onClick={handleAllUsers}
            >
                View all Users
            </a>
        </div>}
    </>);
}
export default ClubMembers;