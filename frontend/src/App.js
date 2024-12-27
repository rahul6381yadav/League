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


// App component
function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/" element={<Login />} />
        <Route path="/forget" element={<Forget />} />
        <Route path="/VerifyOTP" element={<VerifyOTP />} />
        <Route path="/newPassword" element={<NewPassword />} />
      </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
