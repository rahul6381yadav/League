import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import Forget from './components/auth/Forget';
import VerifyOTP from './components/auth/otp';
import NewPassword from './components/auth/newPassword';
import Home from './components/Home/Home';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Clubs from './components/Home/Clubs';
import MyProfile from './components/Home/myprofile';
import { RoleProvider, useRole } from './context/RoleContext';
import Createclub from './components/Home/createclub';
import AdminLogin from './components/auth/adminLogin';
import AdminPanel from './components/admin/adminPanel';
import { EmailProvider } from './context/EmailContext';
import ClubMembers from './components/club_page/ClubMember';
import ViewUsers from './components/club_page/ViewUsers';
import ClubPages from './components/clubs/ClubPages';
import Loader from './components/loader/loader';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!token) {
        setIsAuthenticated(false);
        navigate('/');
      }
      if (isAuthenticated === false) {
        navigate('/');
      }
    };

    checkAuthentication(); // Run authentication check

  }, [isAuthenticated, navigate, token, setIsAuthenticated]);

  return children;
};

const PrivateRoutes = ({ children, requiredRole }) => {
  const { roles } = useRole();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/');
      }
      if (isAuthenticated && requiredRole && roles !== requiredRole && roles !== 'admin') {
        navigate('/home');
      }
      if (isAuthenticated  && roles === 'admin') {
        navigate('/');
      }
    }, 10);

    return () => clearTimeout(timeout);
  }, [navigate, isAuthenticated, requiredRole, roles]);

  return children;
};


const AdminRoutes = ({ children }) => {
  const { roles } = useRole();
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const token = localStorage.getItem("authToken");
  useEffect(() => {
    const checkAdmin = async () => {
      if (!token) {
        setIsAuthenticated(false);
        navigate('/admin');
      }
      if (isAuthenticated === false) {
        navigate('/admin');
      }
    }
    checkAdmin();
  }, [isAuthenticated, navigate, token, setIsAuthenticated]);
  return children;
};
// App component
function UserRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <Loader />}
      <Routes>
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/Clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
        <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
        <Route path="/ClubPages" element={<ProtectedRoute><ClubPages /></ProtectedRoute>} />
        <Route path="/Clubs/ClubMember" element={<ProtectedRoute><ClubMembers /></ProtectedRoute>} />
        <Route path="/ViewUsers" element={<ProtectedRoute><ViewUsers /></ProtectedRoute>} />
        <Route path="/createclub" element={<PrivateRoutes requiredRole="cosa"><Createclub /></PrivateRoutes>} />
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/adminPanel" element={<AdminRoutes><AdminPanel/></AdminRoutes>}/>
        <Route path="/forget" element={<Forget />} />
        <Route path="/VerifyOTP" element={<VerifyOTP />} />
        <Route path="/newPassword" element={<NewPassword />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <RoleProvider>
      <EmailProvider>
        <AuthProvider>
          <Router>
            <UserRoutes />
          </Router>
        </AuthProvider>
      </EmailProvider>
    </RoleProvider>
  );
}

export default App;
