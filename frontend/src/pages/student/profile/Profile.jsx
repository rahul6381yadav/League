import React, { useEffect, useState } from "react";
import { FaEnvelope, FaGithub, FaInstagram, FaLinkedin, FaPhone, FaTwitter } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import EditProfile from "./EditProfile";
import { backendUrl } from "../../../utils/routes";

const MyProfile = () => {
    const [profile, setProfile] = useState({
        name: "",
        role: "",
        studentId: "",
        TotalPoints: 0,
        photo: "",
        linkedin: "",
        email: "",
        phone: "",
        twitter: "",
        instagram: "",
        github: "",
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
                `${backendUrl}/user/profile?id=${decodedToken.userId}`,
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
                    linkedin: result.user.linkedin,
                    email: result.user.email,
                    phone: result.user.phone,
                    twitter: result.user.twitter,
                    instagram: result.user.instagram,
                    github: result.user.github,
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

            const response = await fetch(
                `${backendUrl}/user/profile?id=${decodedToken.userId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fullName: updatedProfile.name,
                        photo: updatedProfile.photo,
                        linkedin: updatedProfile.linkedin,
                        phone: updatedProfile.phone,
                        twitter: updatedProfile.twitter,
                        instagram: updatedProfile.instagram,
                        github: updatedProfile.github,
                    }),
                }
            );

            if (!response.ok) {
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
        console.log("updated profile : ", updatedProfile);
        setProfile(updatedProfile);
        updateProfileDetails(updatedProfile);
    };

    useEffect(() => {
        fetchProfileDetails();
    }, []);

    return (
        <div className="min-h-screen p-8 bg-mirage-50 dark:bg-mirage-950">
            <div className="p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                        <img
                            src={profile.photo || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"}
                            alt="Profile Avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-mirage-100 dark:border-mirage-700"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-mirage-900 dark:text-mirage-50">{profile.name}</h1>
                            <p className="text-lg text-mirage-700 dark:text-mirage-200">{profile.role}</p>
                            <p className="text-lg text-mirage-700 dark:text-mirage-200">{profile.studentId}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-mirage-100 dark:bg-mirage-700 text-mirage-900 dark:text-mirage-50 hover:bg-mirage-300 dark:hover:bg-mirage-600 transition-colors"
                    >
                        Edit Profile
                    </button>
                </div>

                {/* Points Display */}
                <div className="mb-8 p-6 rounded-lg bg-mirage-100 dark:bg-mirage-900">
                    <div className="text-center">
                        <p className="text-6xl font-bold text-mirage-900 dark:text-mirage-50">{profile.TotalPoints}</p>
                        <p className="text-sm text-mirage-700 dark:text-mirage-200 mt-2">Total Points</p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="p-6 rounded-lg bg-mirage-100 dark:bg-mirage-900">
                    <h2 className="text-xl font-bold mb-6 text-mirage-900 dark:text-mirage-50">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ContactItem
                            icon={<FaLinkedin />}
                            label="LinkedIn"
                            value={profile.linkedin}
                            isLink
                        />
                        <ContactItem
                            icon={<FaEnvelope />}
                            label="Email"
                            value={profile.email}
                            isEmail
                        />
                        <ContactItem
                            icon={<FaPhone />}
                            label="Phone"
                            value={profile.phone}
                            isPhone
                        />
                        <ContactItem
                            icon={<FaTwitter />}
                            label="Twitter"
                            value={profile.twitter}
                            isLink
                        />
                        <ContactItem
                            icon={<FaInstagram />}
                            label="Instagram"
                            value={profile.instagram}
                            isLink
                        />
                        <ContactItem
                            icon={<FaGithub />}
                            label="GitHub"
                            value={profile.github}
                            isLink
                        />
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

const ContactItem = ({ icon, label, value, isLink, isEmail, isPhone }) => {
    if (!value) return null; // Skip if value is not available

    let href = value;
    if (isEmail) {
        href = `mailto:${value}`;
    } else if (isPhone) {
        href = `tel:${value}`;
    } else if (isLink) {
        // Generate the appropriate URLs based on the platform
        if (label === "LinkedIn") {
            href = `https://www.linkedin.com/in/${value}`;
        } else if (label === "Twitter") {
            href = `https://twitter.com/${value}`;
        } else if (label === "Instagram") {
            href = `https://www.instagram.com/${value}`;
        } else if (label === "GitHub") {
            href = `https://github.com/${value}`;
        }
    }

    return (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-mirage-200 dark:bg-mirage-800">
            <div className="text-xl text-mirage-700 dark:text-mirage-200">
                {icon}
            </div>
            {isLink || isEmail || isPhone ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mirage-900 dark:text-mirage-50 hover:text-mirage-700 dark:hover:text-mirage-200 transition-colors"
                >
                    {value}
                </a>
            ) : (
                <span className="text-mirage-900 dark:text-mirage-50">{value}</span>
            )}
        </div>
    );
};


export default MyProfile;