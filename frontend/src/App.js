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
      if (isAuthenticated&&requiredRole && roles !== requiredRole) {
        navigate('/home');
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/Clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
            <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/createclub" element={<PrivateRoutes requiredRole="cosa"><Createclub/></PrivateRoutes>}/> 
          <Route path="/" element={<Login />} />
          <Route path="/forget" element={<Forget />} />
          <Route path="/VerifyOTP" element={<VerifyOTP />} />
          <Route path="/newPassword" element={<NewPassword />} />
        </Routes>
        </Router>
    </AuthProvider>
      </RoleProvider>
  );

}

export default App;
