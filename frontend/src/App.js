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
import MyProfile from './pages/student/profile/Profile';
import CreateEvents from "./pages/coordinator/manageEvents/CreateEvent";
import AllMember from './pages/student/friends/allMember';
import OtherMembers from './pages/student/friends/otherMember';
import LeaderboardLanding from './pages/landing/landingPage';
import EditEvents from './pages/coordinator/manageEvents/EditEvents';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/landing" element={<LeaderboardLanding/>}/>
            <Route path="/" element={<Login/>}/>
            <Route path="/admin" element={<AdminLogin/>}/>
            <Route path="/forget-password" element={<ForgetPassword/>}/>

            {/* Student Routes */}
            <Route path="/home" element={<Layout><HomePage/></Layout>}/>
            <Route path="/event-signup/:id" element={<Layout><EventSignUp/></Layout>}/>
            <Route path="/clubs" element={<Layout><Clubs/></Layout>}/>
            <Route path="/club-events" element={<Layout><ClubEventsPage/></Layout>}/>
            <Route path="/all-events" element={<Layout><AllEvents/></Layout>}/>
            <Route path="/my-events" element={<Layout><MyEvents /></Layout>} />
            <Route path="/myProfile" element={<Layout><MyProfile /></Layout>} />
            <Route path="/friends" element={<Layout><AllMember /></Layout>} />
            <Route path="/friends/:id" element={<Layout><OtherMembers/></Layout>}/>

            {/* Coordinator Routes */}
            <Route path="/dashboard" element={<LayoutCoordinator><CoordinatorDashboard/></LayoutCoordinator>}/>
            <Route path="/manage-events" element={<LayoutCoordinator><EventPage/></LayoutCoordinator>}/>
            <Route path="/events/:id" element={<LayoutCoordinator><ManageParticipants/></LayoutCoordinator>}/>
            <Route path="/my-club" element={<LayoutCoordinator><MyClub/></LayoutCoordinator>}/>
            <Route path="/events/create" element={<LayoutCoordinator><CreateEvents /></LayoutCoordinator>} />
            <Route path="/events/edit/:id" element={<LayoutCoordinator><EditEvents/></LayoutCoordinator>} />


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
