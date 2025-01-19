import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';

function NewPassword() {
    const {isOTPVerified} = useAuth();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const {email} = location.state || {};

    useEffect(() => {
        if (!email) {
            setError("No email found. Redirecting to the forgot password page...");
            navigate("/forget-password"); // Redirect to the forgot password page
        } else if (!isOTPVerified) {
            navigate("/"); // Redirect to login page if OTP is not verified
        }
    }, [email, isOTPVerified, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please try again.");
            setMessage(null);
            return;
        }


        try {
            const response = await fetch(`http://localhost:4000user/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email: email, newPassword: newPassword}),
            });

            let result = await response.json();

            if (response.ok) {
                setMessage("Password reset successfully. You may now log in.");
                setError(null);
                navigate("/"); // Redirect to login page
            } else {
                setError(result.message || "Failed to reset password. Try again.");
                setMessage(null);
            }

            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.log(err);
            setError("Failed to reset password. Try again later.");
            setMessage(null);
        }
    };

    return (
        <>
            <iframe
                src="./background.html" // Path to the HTML file in the public folder
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100vh",
                    border: "none",
                    zIndex: -1, // Ensures the background stays behind the content
                }}
                title="Background Design"
            />

            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-full max-w-md rounded-lg shadow-lg">
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-center text-black">Reset Password</h2>

                        <p className="text-sm text-gray-600 text-center">
                            Enter and confirm your new password.
                        </p>

                        {message && (
                            <div className="text-green-500 text-sm text-center">{message}</div>
                        )}

                        {error && (
                            <div className="text-red-500 text-sm text-center">{error}</div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="Enter your new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Reset Password
                            </button>
                        </form>

                        <div className="flex justify-center items-center mt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NewPassword;
