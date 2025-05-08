import React, {memo, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {sendPasswordResetEmail} from "firebase/auth";
import {auth} from "../../firebase";
import { AlertCircle, Mail } from 'lucide-react';

const Forget = memo(() =>{
    const {setForgotPasswordState} = useAuth();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Check your inbox.");
            setEmail("");
            setError("");
        } catch (err) {
            setError(err.message);
            setMessage("");
        }
    };


    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            navigate("/home"); 
        }
    }, [navigate]);

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
                      Reset Password
                    </h1>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Enter your email address to recieve password reset link</p>
            </div>

            {/* Success Message */}
            {message && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}
    
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
    
    
              <button
                onClick={handleReset}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
              >
               Send Reset Link
              </button>
            </div>

            <div className="flex justify-center items-center mt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Back to Login
                            </button>
                        </div>
    
         
          </div>
    
        </div>
      );
})

export default Forget;
