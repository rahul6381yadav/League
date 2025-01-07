import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://192.168.11.8:4000/user/forgot-password", { email });

            if (response.status === 200) {
                setMessage(response.data.message);
                setEmail("");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md rounded-lg shadow-lg">
                <div className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-center">Forgot Password</h2>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Submit
                        </button>
                    </form>

                    {message && <div className="mt-4 text-green-500 text-sm">{message}</div>}
                    {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
