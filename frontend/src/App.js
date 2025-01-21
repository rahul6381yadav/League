import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {RoleProvider} from './context/RoleContext';
import {EmailProvider} from './context/EmailContext';
import {DarkModeProvider} from './context/ThemeContext';

import Login from './pages/auth/Login';
import ForgetPassword from './pages/auth/Forget';
import AdminLogin from './pages/auth/adminLogin';

import ClubEventsPage from './pages/coordinator/manageEvents/ClubEvents';
import CreateClub from './pages/cosa/createclub';
import AdminPanel from './pages/admin/adminPanel';
import CoordinatorDashboard from './pages/coordinator/dashboard/Dashboard';
import ManageParticipants from './pages/coordinator/manageEvents/manageParticipants/ManageParticipants';
import EventPage from './pages/student/clubs/events/EventPage';
import MyClub from './pages/coordinator/clubDetails/ClubDetails';
import EventSignUp from './pages/student/clubs/events/components/EventSignUp';
import Layout from './pages/student/Layout';
import LayoutCoordinator from './pages/coordinator/Layout';
import ProtectedRoute from './utils/ProtectedRoute';
import HomePage from './pages/student/home/Home';
import Clubs from './pages/student/clubs/Clubs';
import AllEvents from "./pages/student/allEvents/AllEvents";
import MyEvents from "./pages/student/myEvents/MyEvents";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/admin" element={<AdminLogin/>}/>
            <Route path="/forget-password" element={<ForgetPassword/>}/>
            <Route path="/event-signup/:id" element={<Layout><EventSignUp/></Layout>}/>

            {/* Student Routes */}
            <Route path="/home" element={<Layout><HomePage/></Layout>}/>
            <Route path="/clubs" element={<Layout><Clubs/></Layout>}/>
            <Route path="/club-events" element={<Layout><ClubEventsPage/></Layout>}/>
            <Route path="/all-events" element={<Layout><AllEvents/></Layout>}/>
            <Route path="/my-events" element={<Layout><MyEvents/></Layout>}/>

            {/* Coordinator Routes */}
            <Route path="/dashboard" element={<LayoutCoordinator><CoordinatorDashboard/></LayoutCoordinator>}/>
            <Route path="/manage-events" element={<LayoutCoordinator><EventPage/></LayoutCoordinator>}/>
            <Route path="/events/:id" element={<LayoutCoordinator><ManageParticipants/></LayoutCoordinator>}/>
            <Route path="/my-club" element={<LayoutCoordinator><MyClub/></LayoutCoordinator>}/>

            {/* Admin Routes */}
            <Route path="/admin-panel" element={<ProtectedRoute requiredRole="admin"><AdminPanel/></ProtectedRoute>}/>

            {/* CoSA Routes */}
            <Route path="/create-club" element={<ProtectedRoute requiredRole="cosa"><CreateClub/></ProtectedRoute>}/>
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
                            <AppRoutes/>
                        </DarkModeProvider>
                    </Router>
                </EmailProvider>
            </RoleProvider>
        </AuthProvider>
    );
}

export default App;
