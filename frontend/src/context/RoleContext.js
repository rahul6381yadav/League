import React, { createContext, useState,useContext} from 'react';

const RoleContext = createContext();
export const useRole = () => useContext(RoleContext);
export const RoleProvider = ({ children }) => {
    // const [roles, setRole] = useState("student"); // Default role is null
    const [roles, setRole] = useState(() => {
        return localStorage.getItem('roles') || 'student'; // Default role is "student"
    });
    const updateRole = (roles) => {
        setRole(roles);
        localStorage.setItem('roles', roles);
    };
    return (
        <RoleContext.Provider value={{ roles, setRole:updateRole }}>
            {children}
        </RoleContext.Provider>
    );
};
