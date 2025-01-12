import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
import {useAuth} from "../../context/FirebaseAuthContext"
import { useRole } from '../../context/RoleContext';
import { useEmail } from '../../context/EmailContext';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {auth} from "../../firebase"
import Spinner from "../common/circulaRIndicator"

function Login() {
    const [activeTab, setActiveTab] = useState("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [Error, setError] = useState("");
    const [loading, setLoading] = useState("");
    // const { setIsAuthenticated } = useAuth();
    const { setRole } = useRole();
    const { setEmailCont } = useEmail();

    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        setLoading(true);
        e.preventDefault();
        const response = await loginWithEmail(email, password);
        if (response.success) {
            setError(null);
            try {
                console.log(response.user);
                const firebaseToken = await (response.user).accessToken;
                const reqBody = {
                    email: (response.user).email,
                    role: activeTab,
                    photo: (response.user).photoURL,
                    fullName: (response.user).displayName
                };
                const res = await fetch('http://localhost:4000/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reqBody),
                });
    
                const result = await res.json();
                console.log(result.token);
                if (res.ok) {
                    console.log("Login successful:", result);
                    localStorage.setItem("authToken", result.token);
                    localStorage.setItem("token", firebaseToken);
                    // setIsAuthenticated(true);
                    setRole(activeTab);
                    setEmailCont(email);
                    setError(null);
                    navigate('/home');
                    setLoading(false);
                } else {
                    setLoading(false);
                    setError(result.message);
                }
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

    const handleGoogleAuthentication = async () => {
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
                const res = await fetch('http://localhost:4000/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reqBody),
                });
    
                const result = await res.json();
                console.log(result.token);
                if (res.ok) {
                    console.log("Login successful:", result);
                    localStorage.setItem("authToken", result.token);
                    localStorage.setItem("token", firebaseToken);
                    // setIsAuthenticated(true);
                    setRole(activeTab);
                    setEmailCont(email);
                    setError(null);
                    navigate('/home');
                    setLoading(false);
                } else {
                    setLoading(false);
                    setError(result.message);
                }
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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // useEffect(() => {
    //     const token = localStorage.getItem("authToken");
    //     if (token && window.location.pathname !== "/home") {
    //         navigate("/home"); // Redirect to Home if already logged in
    //     }
    // }, [navigate]);

    return (
        <>
            <iframe
                src="./background.html"  // Path to the HTML file in the public folder
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100vh",
                    border: "none",
                    zIndex: -1,  // Ensures the background stays behind the content
                }}
                title="Background Design"
            />
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-full max-w-md rounded-lg shadow-lg">
                    <div className="flex border-b ">
                        <button
                            className={`flex-1 p-3 text-center ${activeTab === "student" ? "bg-blue-500 text-white" : ""} rounded-tl-lg`}
                            onClick={() => handleTabChange("student")}
                        >
                            Student
                        </button>
                        <button
                            className={`flex-1 p-3 text-center ${activeTab === "cosa" ? "bg-blue-500 text-white" : ""}`}
                            onClick={() => handleTabChange("cosa")}
                        >
                            COSA
                        </button>
                        <button
                            className={`flex-1 p-3 text-center ${activeTab === "coordinator" ? "bg-blue-500 text-white" : ""}`}
                            onClick={() => handleTabChange("coordinator")}
                        >
                            Coordinator
                        </button>
                        <button
                            className={`flex-1 p-3 text-center ${activeTab === "faculty" ? "bg-blue-500 text-white" : ""} rounded-tr-lg`}
                            onClick={() => handleTabChange("faculty")}
                        >
                            Faculty
                        </button>
                    </div>

                    {/* Login Form */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-center text-black">{`Login as ${activeTab}`}</h2>

                        <form className="space-y-4" onSubmit={handleEmailLogin}>
                            <div>
                                <p className="text-sm text-red-600 text-center">
                                    {Error}
                                </p>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Login
                            </button>
                        </form>

                        {/* Forgot Password and Sign In with Google */}
                        <div className="flex justify-between items-center mt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/forget')}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Forgot Password?
                            </button>

                            {/* Google Sign-In Button */}
                            <button
                                onClick={handleGoogleAuthentication}
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
            </div>
            {loading && (<div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center'><Spinner className='h-10 w-10 border-blue-500'/></div>  )}
        </>
    );
}

export default Login;

const loginWithEmail = async (email, password) => {
    try {
        const persistence = browserLocalPersistence;

        if (persistence) {
            await setPersistence(auth, persistence);
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user, message: "" };
    } catch (error) {
        console.log(error);
        let errorMessage = 'Something went wrong.';
        if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid Credentials. Please try again.';
        }
        return { success: false, message: errorMessage, user: {} };
    }
};

const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const persistence = browserLocalPersistence;

        if (persistence) {
            await setPersistence(auth, persistence);
        }
        const user = (await signInWithPopup(auth, provider)).user;
        console.log('User logged in with Google:', user);
        return { success: true, user: user, message: "User Successfully logged In" };
    } catch (error) {
        console.error('Error during Google login:', error.message);
        let errorMessage = 'Something went wrong.';
        if (error.code === 'auth/invalid-credential') {
            errorMessage = `${error.code}. Please try again.`;
        }
        return { success: false, message: errorMessage, user: {} };
    }
};