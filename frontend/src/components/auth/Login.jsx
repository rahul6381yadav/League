import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useEmail } from '../../context/EmailContext';

function Login() {
    const [activeTab, setActiveTab] = useState("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [Error, setError] = useState("");
    const { setIsAuthenticated } = useAuth();
    const { setRole } = useRole();
    const { setEmailCont } = useEmail();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token && window.location.pathname !== "/home") {
            navigate("/home"); // Redirect to Home if already logged in
        }
    }, [navigate]);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleGoogleSignIn = () => {
        console.log("Sign in with Google");
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page

        const loginData = {
            email,
            password,
            roles: activeTab,
        };

        try {
            const response = await fetch("http://192.168.11.8:4000/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Login successful:", result);
                localStorage.setItem("authToken", result.token);
                setIsAuthenticated(true);
                setRole(activeTab);
                setEmailCont(email);
                navigate('/home');
            } else {
                setError(result.message);
                console.error("Login failed:", result.message);

            }
            setEmail("");
            setPassword("");
        } catch (error) {
            console.error("Error during login request:", error);
        }
    };

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

                        <form className="space-y-4" onSubmit={handleSubmit}>
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
                                onClick={handleGoogleSignIn}
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
        </>
    );
}

export default Login;
