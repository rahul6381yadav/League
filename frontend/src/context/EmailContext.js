import React, { createContext, useState,useContext} from 'react';

const EmailContext = createContext();
export const useEmail = () => useContext(EmailContext);
export const EmailProvider = ({ children }) => {
    // const [roles, setRole] = useState("student"); // Default role is null
    const [emailCont, setEmailCont] = useState(() => {
        return localStorage.getItem('emailCont') || ''; // Default role is "student"
    });
    const updateEmail = (email) => {
        setEmailCont(email);
        localStorage.setItem('emailCont', email);
    };
    return (
        <EmailContext.Provider value={{ emailCont, setEmailCont:updateEmail }}>
            {children}
        </EmailContext.Provider>
    );
};
