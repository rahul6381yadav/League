// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Create a context to hold authentication state
const AuthContext = createContext();

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap the app with the authentication context
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [forgotPasswordState, setForgotPasswordState] = useState(false);
    const [isOTPVerified, setisOTPVerified] = useState(false);
    const [userId, setUserId] = useState(null);

    // Check if the user is authenticated on initial load
    useEffect(() => {
        console.log("auth Context");
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId);
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decoded.exp > currentTime) {
                    // Token is valid
                    setIsAuthenticated(true);
                } else {
                    // Token is expired
                    localStorage.removeItem("authToken");
                    setIsAuthenticated(false);
                }
            } catch (error) {
                // If the token is invalid or there's an error decoding it
                localStorage.removeItem("authToken");
                setIsAuthenticated(false);
            }
       
        } else {
         
            setIsAuthenticated(false); // No token found
        }
    }, []); // Empty dependency array to run this effect only once (on mount)

    const logout = () => {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                logout,
                forgotPasswordState,
                setForgotPasswordState,
                isOTPVerified,
                setisOTPVerified,
                userId
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
