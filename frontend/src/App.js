import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Forget from './components/auth/Forget';
import VerifyOTP from './components/auth/otp';
import NewPassword from './components/auth/newPassword';
import Home from './components/Home/Home';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Clubs from './components/Home/Clubs';
import MyProfile from './components/Home/myprofile';
import { RoleProvider,useRole} from './context/RoleContext';
import Createclub from './components/Home/createclub';
import AdminLogin from './components/auth/adminLogin';
import AdminPanel from './components/admin/adminPanel';
import ClubPage from './components/clubs/clubpage';
import Codesoc from './components/clubs/Codesoc';
import Electrogeeks from './components/clubs/Elctrogeeks';
import Finesse from './components/clubs/Finesse';
import Finspiration from './components/clubs/Finspiration';
import Xposure from './components/clubs/Xposure';
import NSO from './components/clubs/NSO';
import NSS from './components/clubs/NSS';
import SAS from './components/clubs/Stage&Studio';
import EHaCs from './components/clubs/E-HaCs';
import DeepLabs from './components/clubs/Deep-Labs';
import DevX from './components/clubs/DevX';
import { EmailProvider } from './context/EmailContext';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isAuthenticated === false) {
        navigate('/');
      }
    }, 1000);
    
    return () => clearTimeout(timeout);

  }, [isAuthenticated, navigate]);
  
  return children;
};

const PrivateRoutes = ({ children,requiredRole }) => {
  const { roles } = useRole(); 
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  console.log("roles is ", roles);
  console.log("required role ", requiredRole);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/');
      }
      if (isAuthenticated && requiredRole && roles !== requiredRole && roles !== 'admin') {
        navigate('/home');
      }
      if (isAuthenticated && requiredRole && roles !== requiredRole &&roles==='admin') {
        navigate('/');
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [navigate,isAuthenticated,requiredRole,roles]);
  return children;
}


// App component
function App() {
  return (

    <RoleProvider>
      <EmailProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/Clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
            <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/clubpage" element={<ProtectedRoute><ClubPage /></ProtectedRoute>} />
            <Route path="/Clubs/Codesoc" element={<ProtectedRoute><Codesoc /></ProtectedRoute>} />
            <Route path="/Clubs/Electrogeeks" element={<ProtectedRoute><Electrogeeks /></ProtectedRoute>} />
            <Route path="/Clubs/Finesse" element={<ProtectedRoute><Finesse /></ProtectedRoute>} />
            <Route path="/Clubs/Finspiration" element={<ProtectedRoute><Finspiration /></ProtectedRoute>} />
            <Route path="/Clubs/Xposure" element={<ProtectedRoute><Xposure /></ProtectedRoute>} />
            <Route path="/Clubs/NSO" element={<ProtectedRoute><NSO /></ProtectedRoute>} />
            <Route path="/Clubs/NSS" element={<ProtectedRoute><NSS /></ProtectedRoute>} />
            <Route path="/Clubs/Stage&Studio" element={<ProtectedRoute><SAS /></ProtectedRoute>} />
            <Route path="/Clubs/E-HaCs" element={<ProtectedRoute><EHaCs /></ProtectedRoute>} />
            <Route path="/Clubs/Deep-Labs" element={<ProtectedRoute><DeepLabs /></ProtectedRoute>} />
            <Route path="/Clubs/DeVX" element={<ProtectedRoute><DevX/></ProtectedRoute>} />
            <Route path="/createclub" element={<PrivateRoutes requiredRole="cosa"><Createclub /></PrivateRoutes>} /> 
            <Route path="/adminPanel" element={<PrivateRoutes requiredRole="admin"><AdminPanel/></PrivateRoutes>}/>
            <Route path="/" element={<Login />} />
            <Route path="/admin" element={<AdminLogin/>}/>
          <Route path="/forget" element={<Forget />} />
          <Route path="/VerifyOTP" element={<VerifyOTP />} />
          <Route path="/newPassword" element={<NewPassword />} />
        </Routes>
        </Router>
        </AuthProvider>
      </EmailProvider>
      </RoleProvider>
  );

}

export default App;
