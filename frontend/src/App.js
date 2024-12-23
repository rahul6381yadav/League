import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Forget from './components/auth/Forget';
import VerifyOTP from './components/auth/otp';
import NewPassword from './components/auth/newPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/forget" element={<Forget />} />
        <Route path="/VerifyOTP" element={<VerifyOTP />} />
        <Route path="/newPassword" element={<NewPassword/>}/>
      </Routes>
    </Router>
  );
}

export default App;
