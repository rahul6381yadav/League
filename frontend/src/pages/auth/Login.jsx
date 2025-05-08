import React, { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { loginWithEmail, loginWithGoogle } from '../../utils/FirebaseAuthService';
import { backendUrl } from '../../utils/routes';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = memo(() => {
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { role, setRole } = useRole();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    setLoading(true);
    e.preventDefault();
    const response = await loginWithEmail(email, password);
    if (response.success) {
      setError(null);
      try {
        const firebaseToken = await response.user.accessToken;
        const reqBody = {
          email: response.user.email,
          role: activeTab,
          photo: response.user.photoURL,
          fullName: response.user.displayName
        };
        const res = await fetch(`${backendUrl}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqBody),
        });

        const result = await res.json();
        if (res.ok) {
          setError(null);
          localStorage.setItem("jwtToken", result.token);
          localStorage.setItem("authToken", firebaseToken);
          setRole(activeTab);
          if (activeTab === 'student') {
            navigate('/home');
          } else if (activeTab === 'coordinator') {
            navigate('/dashboard');
          }
        } else {
          setError(result.message);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
        setError('Something went wrong.');
      }
    } else {
      setLoading(false);
      setError(response.message);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const response = await loginWithGoogle();
    if (response.success) {
      setError(null);
      try {
        const firebaseToken = await response.user.accessToken;
        const reqBody = {
          email: response.user.email,
          role: activeTab,
          photo: response.user.photoURL,
          fullName: response.user.displayName
        };
        const res = await fetch(`${backendUrl}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqBody),
        });

        const result = await res.json();
        if (res.ok) {
          setError(null);
          localStorage.setItem("jwtToken", result.token);
          localStorage.setItem("authToken", firebaseToken);
          setRole(activeTab);
          if (activeTab === 'student') {
            navigate('/home');
          } else if (activeTab === 'coordinator') {
            navigate('/dashboard');
          }
        } else {
          setError(result.message);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
        setError('Something went wrong.');
      }
    } else {
      setLoading(false);
      setError(response.message);
    }
  };

  const Tabs = {
    "student": "Student",
    "faculty": "Faculty",
    "coordinator": "Coordinator",
    "cosa": "CoSA"
  };

  const handleForgotPassword = () => {
    navigate("/forget-password");
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      if (role === "student") {
        navigate("/home");
      } else if (role === "coordinator") {
        navigate("/dashboard");
      } else if (role === "admin") {
        navigate("/admin");
      }
    }
  }, [navigate, role]);

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900">
        {/* Abstract Shapes - Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full opacity-10 transform translate-x-1/2 translate-y-1/2"></div>
        
        {/* Light Streaks */}
        <div className="absolute top-0 left-1/3 w-4 h-full bg-gradient-to-b from-transparent via-purple-300 to-transparent opacity-20 transform -rotate-45"></div>
        <div className="absolute top-0 right-1/3 w-4 h-full bg-gradient-to-b from-transparent via-blue-300 to-transparent opacity-20 transform rotate-45"></div>
        
        {/* Geometric Patterns */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      
      {/* Login Card with Glass Effect */}
      <div className="w-full max-w-md p-6 mx-4 bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm rounded-lg shadow-2xl z-10">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="inline-block p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transform rotate-3">
              <div className="bg-white p-1 rounded-md transform -rotate-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent px-2">
                  League of IIITR
                </h1>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Sign in to access your account</p>
        </div>

        {/* Role Selector */}
        <div className="flex mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-1 shadow-inner">
          {Object.entries(Tabs).map(([key, value]) => (
            <button
              key={key}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === key
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-indigo-700 hover:bg-white hover:shadow-sm'
              }`}
              onClick={() => setActiveTab(key)}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              className="pl-10 w-full p-3 bg-white border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm focus:shadow"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              className="pl-10 w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleEmailLogin}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-all shadow-sm hover:shadow transform hover:scale-105"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">Continue with Google</span>
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-800 hover:to-purple-800 hover:underline font-medium"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      {/* Overlay Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-xl">
            <div className="relative">
              <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-l-4 border-r-4 border-purple-600 rounded-full animate-spin absolute top-0 left-0" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="mt-4 text-center text-sm font-medium text-gray-700">Signing in...</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default Login;