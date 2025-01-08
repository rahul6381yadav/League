import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';

function AdminLogin() {
    const [email, setEmail] = useState("");  // Changed username to email
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { setIsAuthenticated } = useAuth();
    const { setRole } = useRole();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token && window.location.pathname !== "/adminPanel") {
            navigate("/adminPanel"); // Redirect to admin home if already logged in
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page

        const loginData = {
            email,  // Changed from studentId to email
            password,
            roles: "admin", // Always set role as admin
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/user/login`, {
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
                setRole("admin");
                navigate('/adminPanel');
            } else {
                setError(result.message);
                console.error("Login failed:", result.message);
            }
            setEmail("");  // Reset email field
            setPassword("");  // Reset password field
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
                    {/* Login Form */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-center text-black">Admin Login</h2>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <p className="text-sm text-red-600 text-center">
                                    {error}
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
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminLogin;
