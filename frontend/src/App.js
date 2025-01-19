import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import { EmailProvider } from './context/EmailContext';
import { DarkModeProvider } from './context/ThemeContext';

import Login from './pages/auth/Login';
import ForgetPassword from './pages/auth/Forget';
import AdminLogin from './pages/auth/adminLogin';

import Home from './components/Home/Home';
import Clubs from './components/Home/Clubs';
import ClubEventsPage from './components/clubs/ClubPages';
import CreateClub from './components/Home/createclub';
import AdminPanel from './pages/admin/adminPanel';
import CoordinatorDashboard from './components/Club_coordinators/home_club';
import ManageParticipants from './components/clubs/ManageParticipants';
import EventPage from './components/manageEvents/EventPage';
import MyClub from './components/Club_coordinators/MyClub';
import AllEvents from './components/club_page/AllEvents';

import Layout from './components/Home/LayoutStudent';
import LayoutCoordinator from './components/Club_coordinators/LayoutCoordinator';
import ProtectedRoute from './utils/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/forget-password" element={<ForgetPassword />} />

      {/* Student Routes */}
      <Route path="/home" element={<Layout><Home /></Layout>} />
      <Route path="/clubs" element={<Layout><Clubs /></Layout>} />
      <Route path="/club-events" element={<Layout><ClubEventsPage /></Layout>} />

      {/* Coordinator Routes */}
      <Route path="/dashboard" element={<LayoutCoordinator><CoordinatorDashboard /></LayoutCoordinator>} />
      <Route path="/manage-events" element={<LayoutCoordinator><EventPage /></LayoutCoordinator>} />
      <Route path="/events/:id" element={<LayoutCoordinator><ManageParticipants /></LayoutCoordinator>} />
      <Route path="/my-club" element={<LayoutCoordinator><MyClub /></LayoutCoordinator>} />

      {/* Admin Routes */}
      <Route path="/admin-panel" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />

      {/* CoSA Routes */}
      <Route path="/create-club" element={<ProtectedRoute requiredRole="cosa"><CreateClub /></ProtectedRoute>} />
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
              <AppRoutes />
            </DarkModeProvider>
          </Router>
        </EmailProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
