import React, {useEffect, useState} from "react";
import {FaEnvelope, FaGithub, FaInstagram, FaLinkedin, FaPhone, FaTwitter} from "react-icons/fa"; // Importing Font Awesome icons
import { jwtDecode } from "jwt-decode";
import EditProfile from "./EditProfile";
import Result_ from "postcss/lib/result";

const MyProfile = () => {
        const [profile, setProfile] = useState({
            name: "",
            role: "",
            studentId: "",
            TotalPoints: 0,
            photo: "",
            contact: {
                linkedin: "",
                email: "",
                phone: "",
                twitter: "",
                instagram: "",
                github: "",
            },
        });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
        const token = localStorage.getItem("jwtToken");
        let decodedToken = null;
        if (token) {
            try {
                decodedToken = jwtDecode(token);
            } catch (error) {
                console.error("Error decoding JWT token:", error.message);
            }
        }

        const fetchProfileDetails = async () => {
            try {
                if (!decodedToken) {
                    console.error("No valid token found");
                    return;
                }

                const response = await fetch(
                    `http://localhost:4000/user/profile?id=${decodedToken.userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const result = await response.json();
                
                if (response.ok && result.user) {
                    setProfile({
                        name: result.user.fullName,
                        role: result.user.role,
                        studentId: result.user.studentId,
                        TotalPoints: result.user.TotalPoints,
                        photo: result.user.photo,
                        contact: {
                            linkedin: "https://www.linkedin.com/in/sarthakjain", // Replace with dynamic data if available
                            email: result.user.email,
                            phone: "+91 123 456 7890", // Replace with dynamic data if available
                            twitter: "https://twitter.com/sarthakjain", // Replace with dynamic data if available
                            instagram: "https://www.instagram.com/sarthakjain", // Replace with dynamic data if available
                            github: "https://github.com/sarthakjain", // Replace with dynamic data if available
                        },
                    });
                } else {
                    console.error("Failed to fetch profile details");
                }
            } catch (error) {
                console.error("Error fetching profile details:", error.message);
            }
        };
    const updateProfileDetails = async (updatedProfile) => {
        try {
            if (!decodedToken || !token) {
                console.error("No valid token found");
                return;
            }
            console.log("Updated profile ", updatedProfile);

            const response = await fetch(
                `http://localhost:4000/user/profile?id=${decodedToken.userId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json", // Added content type header
                    },
                    body: JSON.stringify({
                        fullName: updatedProfile.name,
                        photo:updatedProfile.photo
                    }),
                }
            );

            if (!response.ok) {
                // Check if the response status is OK (2xx)
                console.error("Error updating profile:", response.statusText);
                alert("Error updating profile: " + response.statusText);
                return;
            }

            const result = await response.json();
            if (result.isError) {
                alert("Error in profile editing: " + result.message);
            } else {
                alert("Profile updated successfully!");
            }
        } catch (error) {
            console.log("Error:", error);
            alert("An error occurred while updating the profile.");
        }
    };
    const handleSaveProfile = (updatedProfile) => {
        setProfile(updatedProfile);
        updateProfileDetails(updatedProfile);
        
    };
        useEffect(() => {
            fetchProfileDetails();
        }, []);
        return (
            <div className="max-w-7xl mx-auto p-6 rounded-lg shadow-lg transition-colors duration-300 dark:bg-gray-800 dark:text-white bg-white text-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <img
                            src={profile.photo || "https://static.vecteezy.com/system/resources/thumbnails/028/794/707/small/cartoon-cute-school-boy-photo.jpg"}
                            alt="Profile Avatar"
                            className="w-32 h-32 rounded-full object-cover"
                        />
                        <div>
                            <h1 className="text-3xl font-bold">{profile.name}</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">{profile.role}</p>
                            <p className="text-lg text-gray-600 dark:text-gray-400">{profile.studentId}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Edit Profile
                    </button>
                </div>
                <br />
                <div className="mt-6 grid grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-6xl font-bold">{profile.TotalPoints}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-400">Points</p>
                    </div>
                </div>

                {/* Information Section */}
                <div className="mt-10">
                    <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                    <br />
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-4">
                            <FaLinkedin className="text-blue-600 text-xl" />
                            <a
                                href={profile.contact.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dark:text-white text-gray-800"
                            >
                                LinkedIn
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <FaEnvelope className="text-blue-600 text-xl" />
                            <a href={`mailto:${profile.contact.email}`} className="dark:text-white text-gray-800">
                                {profile.contact.email}
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <FaPhone className="text-blue-600 text-xl" />
                            <a href={`tel:${profile.contact.phone}`} className="dark:text-white text-gray-800">
                                {profile.contact.phone}
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <FaTwitter className="text-blue-600 text-xl" />
                            <a
                                href={profile.contact.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dark:text-white text-gray-800"
                            >
                                Twitter
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <FaInstagram className="text-blue-600 text-xl" />
                            <a
                                href={profile.contact.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dark:text-white text-gray-800"
                            >
                                Instagram
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <FaGithub className="text-blue-600 text-xl" />
                            <a
                                href={profile.contact.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dark:text-white text-gray-800"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
                {isEditModalOpen && (
                    <EditProfile
                        profile={profile}
                        onSave={handleSaveProfile}
                        onClose={() => setIsEditModalOpen(false)}
                    />
                )}
            </div>
        );
    };
export default MyProfile;
