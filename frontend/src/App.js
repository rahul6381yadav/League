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

import Layout from './components/Home/Layout';
import EventPage from './components/manageEvents/EventPage'; 
import ClubCoordinatorPage from './components/Club_coordinators/ClubCoordinatorPage';

import { DarkModeProvider } from './context/DarkModeContext';

const ProtectedRoute = ({ children }) => {
  const { roles } = useRole();
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const token = localStorage.getItem("authToken");
  console.log("protected routes");
  useEffect(() => {
    console.log(token);
    console.log(isAuthenticated);
    const timeout = setTimeout(() => {
      if (!token) {
        setIsAuthenticated(false);
        navigate('/');
      }
      if (isAuthenticated === false && roles!=='admin') {
        navigate('/');
      }
      if (isAuthenticated === true && roles === 'admin') {
        navigate('/AdminPanel');
      }
    }, 10);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, navigate, token, setIsAuthenticated]);

  return children;
};


const AdminRoutes = ({ children }) => {
  console.log("admin Routes");
  const { roles } = useRole();
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const checkAdmin = async () => {
      if (!token || roles !== 'admin') {
        setIsAuthenticated(false);
        navigate('/admin'); // Redirect to admin login
      }
      else {
        navigate('/AdminPanel');
      }
    };
    checkAdmin();
  }, [isAuthenticated, roles, navigate, token, setIsAuthenticated]);

  return children;
};

const PrivateRoutes = ({ children, requiredRole }) => {
  console.log("private routes");
  const { roles } = useRole();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/'); // Redirect to admin login
    } else if (requiredRole && roles !== requiredRole) {
      navigate('/home'); // Redirect to home for unauthorized roles
    }
  }, [isAuthenticated, roles, navigate, requiredRole]);

  return children;
};
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
        <Route path="/home" element={<ProtectedRoute><Layout><Home/></Layout></ProtectedRoute>} />
        <Route path="/Clubs" element={<ProtectedRoute><Layout><Clubs /></Layout></ProtectedRoute>} />
        <Route path="/myprofile" element={<ProtectedRoute><Layout><MyProfile /></Layout></ProtectedRoute>} />
        <Route path="/ClubPages" element={<ProtectedRoute><Layout><ClubPages /></Layout></ProtectedRoute>} />
        <Route path="/Clubs/ClubMember" element={<ProtectedRoute><Layout><ClubMembers /></Layout></ProtectedRoute>} />
        <Route path="/ViewUsers" element={<ProtectedRoute><Layout><ViewUsers /></Layout></ProtectedRoute>} />
        <Route path="/createclub" element={<PrivateRoutes requiredRole="cosa"><Createclub /></PrivateRoutes>} />
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/adminPanel" element={<AdminRoutes><AdminPanel /></AdminRoutes>}/>
        <Route path="/forget" element={<Forget />} />
        <Route path="/VerifyOTP" element={<VerifyOTP />} />
        <Route path="/newPassword" element={<NewPassword />} />

        <Route path="/home/manage-events" element={<Layout><EventPage /></Layout>} />
        <Route path="/home/club-coordinator" element={<Layout><ClubCoordinatorPage /></Layout>} />
        {/* test Route*/}
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <EmailProvider>
          <Router>
            <DarkModeProvider>
              <UserRoutes />
            </DarkModeProvider>
            </Router>
        </EmailProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
