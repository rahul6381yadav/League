import { useNavigate } from 'react-router-dom';
import {useEffect} from 'react';
import { useAuth } from "../context/FirebaseAuthContext";
import { RoleProvider, useRole } from '../context/RoleContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("authToken");
  const { roles } = useRole();
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
            Authenticating, please wait...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
            Redirecting to Sign In Page...
          </p>
        </div>
      </div>
    );
  }

  if(!token){
    navigate("/");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
            Redirecting to Sign In Page...
          </p>
        </div>
      </div>
    );
  }

  if(roles==="coordinator"){
    navigate('/home_club');
  } else if(roles==="admin"){
    navigate('/AdminPanel');
  } else{
    navigate('/home');
  }

  return children;
};

export default ProtectedRoute;