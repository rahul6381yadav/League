import React from "react";
import {useNavigate} from 'react-router-dom';
import {useAuth} from "../context/AuthContext";
import {useRole} from "../context/RoleContext";

const ProtectedRoute = ({children, requiredRole}) => {
    const {user, loading} = useAuth();
    const {role} = useRole();
    const navigate = useNavigate();
    const currentUrl = window.location.pathname + window.location.search;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <div
                        className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
                        Authenticating, please wait...
                    </p>
                </div>
            </div>
        );
    }

    if (!user || (requiredRole && role !== requiredRole)) {
        navigate("/login");
        if(currentUrl != "/home")
        sessionStorage.setItem("redirect", currentUrl);
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <div
                        className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
                        Redirecting to Sign In Page...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
