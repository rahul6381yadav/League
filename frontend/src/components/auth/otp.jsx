import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
function VerifyOTP() {
    const { forgotPasswordState, setisOTPVerified } = useAuth();
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (!forgotPasswordState) {
            navigate("/forget");
        }
    }, [forgotPasswordState, navigate]);
    const handleChange = (element, index) => {
        if (!/^\d*$/.test(element.value)) return; // Only allow digits
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Automatically focus next box if a digit is entered
        if (element.value && index < otp.length - 1) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace to move focus to the previous box
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            e.target.previousSibling.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join(""); // Combine all digits into a single string
        const { email } = location.state || {};
        try {
            const response = await fetch("http://localhost:4000/user/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        email: email,
                        otp: otpValue
                    }
                ),
            });

            const result = await response.json();

            if (response.ok) {
                setisOTPVerified(true);
                navigate("/newPassword", { state: { email } }); // Redirect after successful verification
                // setMessage("OTP verified successfully. You may proceed.");
                // setError(null);
            } else {
                setError(result.message || "Invalid OTP. Please try again.");
                setMessage(null);
            }
            setOtp(new Array(6).fill(""));
        } catch (err) {
            setError("Failed to verify OTP. Try again later.");
            setMessage(null);
        }
    };

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
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-center text-black">OTP Verification</h2>

                        <p className="text-sm text-gray-600 text-center">
                            Enter the 6-digit OTP sent to your email address.
                        </p>

                        {message && (
                            <div className="text-green-500 text-sm text-center">{message}</div>
                        )}

                        {error && (
                            <div className="text-red-500 text-sm text-center">{error}</div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="flex justify-center space-x-2">
                                {otp.map((value, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-black"
                                        maxLength="1"
                                        value={value}
                                        onChange={(e) => handleChange(e.target, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Verify OTP
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

export default VerifyOTP;
