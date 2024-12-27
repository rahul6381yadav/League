// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
// Create a context to hold authentication state
const AuthContext = createContext();

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap the app with the authentication context
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [forgotPasswordState, setForgotPasswordState] = useState(false);
    const [isOTPVerified, setisOTPVerified] = useState(false);

    // Check if the user is authenticated on initial load
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decoded.exp > currentTime) {
                    if (!isAuthenticated) {
                        setIsAuthenticated(true);
                    }
                } else {
                    localStorage.removeItem("authToken");
                    setIsAuthenticated(false);
                }
            } catch (error) {
                localStorage.removeItem("authToken");
                setIsAuthenticated(false);
            }
        }
    }, [isAuthenticated]);

    // Function to log the user out
    const logout = () => {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout, forgotPasswordState, setForgotPasswordState, isOTPVerified,setisOTPVerified}}>
            {children}
        </AuthContext.Provider>
    );
};
