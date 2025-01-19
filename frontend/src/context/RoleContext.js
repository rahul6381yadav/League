import React, {createContext, useContext, useState} from 'react';

const RoleContext = createContext();

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({children}) => {

    const [role, setRole] = useState(() => {
        return localStorage.getItem('role') || 'student';
    });

    const updateRole = (role) => {
        setRole(role);
        localStorage.setItem('role', role);
    };

    return (
        <RoleContext.Provider value={{role, setRole: updateRole}}>
            {children}
        </RoleContext.Provider>
    );
};
