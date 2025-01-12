import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleProvider, useRole } from './context/RoleContext';
import { EmailProvider } from './context/EmailContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { jwtDecode } from 'jwt-decode';
import Login from './components/auth/Login';
import { useNavigate } from 'react-router-dom';
import Forget from './components/auth/Forget';
import VerifyOTP from './components/auth/otp';
import NewPassword from './components/auth/newPassword';
import Home from './components/Home/Home';
import Clubs from './components/Home/Clubs';
import MyProfile from './components/Home/myprofile';
import Createclub from './components/Home/createclub';
import AdminLogin from './components/auth/adminLogin';
import AdminPanel from './components/admin/adminPanel';
import ClubMembers from './components/club_page/ClubMember';
import ViewUsers from './components/club_page/ViewUsers';
import ClubPages from './components/clubs/ClubPages';
import Loader from './components/loader/loader';
import Layout from './components/Home/LayoutStudent';
import Home_club from './components/Club_coordinators/home_club';
import LayoutCoordinator from './components/Club_coordinators/LayoutCoordinator';
import EventPage from './components/manageEvents/EventPage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading } = useAuth();
  const { roles, setRole } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = localStorage.getItem('authToken');
        const payload = jwtDecode(token);
        console.log(payload.role);
        setRole(payload.role);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, setIsAuthenticated, setRole, setLoading]);

  if (!isAuthenticated || (requiredRole && roles !== requiredRole)) {
    navigate("/")
  }

  return children;
};

function UserRoutes() {
  return(
    <Routes>
      <Route path="/home" element={<ProtectedRoute requiredRole="student"><Layout><Home /></Layout></ProtectedRoute>} />
      <Route path="/Clubs" element={<ProtectedRoute requiredRole="student"><Layout><Clubs /></Layout></ProtectedRoute>} />
      <Route path="/myprofile" element={<ProtectedRoute requiredRole="student"><Layout><MyProfile /></Layout></ProtectedRoute>} />
      <Route path="/ClubPages" element={<ProtectedRoute requiredRole="student"><Layout><ClubPages /></Layout></ProtectedRoute>} />
      <Route path="/Clubs/ClubMember" element={<ProtectedRoute requiredRole="student"><Layout><ClubMembers /></Layout></ProtectedRoute>} />
      <Route path="/ViewUsers" element={<ProtectedRoute requiredRole="student"><Layout><ViewUsers /></Layout></ProtectedRoute>} />
      <Route path="/createclub" element={<ProtectedRoute requiredRole="cosa"><Createclub /></ProtectedRoute>} />
      <Route path="/home_club" element={<ProtectedRoute requiredRole="coordinator"><LayoutCoordinator><Home_club /></LayoutCoordinator></ProtectedRoute>} />
      <Route path="/manage-events" element={<ProtectedRoute requiredRole="coordinator"><LayoutCoordinator><EventPage /></LayoutCoordinator></ProtectedRoute>} />
      <Route path="/adminPanel" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/forget" element={<Forget />} />
      <Route path="/VerifyOTP" element={<VerifyOTP />} />
      <Route path="/newPassword" element={<NewPassword />} />
    </Routes>
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
