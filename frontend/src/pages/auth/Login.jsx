import React, { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { loginWithEmail, loginWithGoogle } from '../../utils/FirebaseAuthService';
import { backendUrl } from '../../utils/routes';
import Spinner from "../common/circularIndicator"

const Login = memo(() => {
    const [activeTab, setActiveTab] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { role, setRole} = useRole();
    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        setLoading(true);
        e.preventDefault();
        const response = await loginWithEmail(email, password);
        if (response.success) {
            setError(null);
            try {
                const firebaseToken = await (response.user).accessToken;
                const reqBody = {
                    email: (response.user).email,
                    role: activeTab,
                    photo: (response.user).photoURL,
                    fullName: (response.user).displayName
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
                    }
                    else if (activeTab === 'coordinator') {
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
                const firebaseToken = await (response.user).accessToken;
                const reqBody = {
                    email: (response.user).email,
                    role: activeTab,
                    photo: (response.user).photoURL,
                    fullName: (response.user).displayName
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
                    }
                    else if (activeTab === 'coordinator') {
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
    }

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            if(role==="student"){
                navigate("/home");
            } else if(role==="coordinator"){
                navigate("/dashboard");
            } else if(role==="admin"){
                navigate("/admin");
            }
        }
    }, [navigate]);

    return (
        <>
            <iframe
                src="./background.html"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100vh",
                    border: "none",
                    zIndex: -1,
                }}
                title="Background Design"
            />
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-full max-w-md rounded-lg shadow-lg">
                    <div className="flex border-b">
                        {['student', 'cosa', 'coordinator', 'faculty'].map((tab) => (
                            <button
                                key={tab}
                                className={`flex-1 p-3 text-center ${activeTab === tab ? 'bg-blue-500 text-white' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {Tabs[tab]}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-center text-black">{`Login as ${Tabs[activeTab]}`}</h2>

                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Login
                            </button>
                        </form>

                        {/* Forgot Password and Sign In with Google */}
                        <div className="flex justify-between items-center mt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/forget-password')}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Forgot Password?
                            </button>

                            {/* Google Sign-In Button */}
                            <button
                                onClick={handleGoogleLogin}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <img
                                    src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                                    alt="Google Logo"
                                    className="w-5 h-5"
                                />
                                <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                            </button>
                        </div>


                    </div>
                </div>
                {loading && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <Spinner className="h-10 w-10 border-blue-500" />
                    </div>
                )}
            </div>
        </>
    );
})

export default Login;
