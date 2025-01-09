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
import AllEvents from './components/Events/AllEvents';
import Layout from './components/Home/Layout';

const ProtectedRoute = ({ children }) => {
  const { roles } = useRole();
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const checkAuthentication = () => {
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
      if (token && isAuthenticated&&roles==='admin'&&window.location.pathname !== "/adminPanel") {
        navigate("/adminPanel"); // Redirect to Home if already logged in
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
        <Route path="/home" element={<ProtectedRoute><Layout><Home/></Layout></ProtectedRoute>} />
        <Route path="/Clubs" element={<ProtectedRoute><Layout><Clubs /></Layout></ProtectedRoute>} />
        <Route path="/myprofile" element={<ProtectedRoute><Layout><MyProfile /></Layout></ProtectedRoute>} />
        <Route path="/ClubPages" element={<ProtectedRoute><Layout><ClubPages /></Layout></ProtectedRoute>} />
        <Route path="/Clubs/ClubMember" element={<ProtectedRoute><Layout><ClubMembers /></Layout></ProtectedRoute>} />
        <Route path="/AllEvents" element={<ProtectedRoute><Layout><AllEvents /></Layout></ProtectedRoute>}/>
        <Route path="/ViewUsers" element={<ProtectedRoute><Layout><ViewUsers /></Layout></ProtectedRoute>} />
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
    <AuthProvider>
      <RoleProvider>
        <EmailProvider>
            <Router>
              <UserRoutes />
            </Router>
        </EmailProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
