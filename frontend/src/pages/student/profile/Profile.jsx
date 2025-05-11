import React, { useEffect, useState } from "react";
import { FaEnvelope, FaGithub, FaInstagram, FaLinkedin, FaPhone, FaPencilAlt } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
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
        LeeTrack: "",
        email: "",
        phone: "",
        Leetcode: "",
        instagram: "",
        github: "",
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
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
                    LeeTrack: result.user.LeeTrack,
                    phone: result.user.phone,
                    Leetcode: result.user.Leetcode,
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
                        Leetcode: updatedProfile.Leetcode,
                        LeeTrack: updatedProfile.LeeTrack,
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

    const updateProfilePhoto = async (photoFile) => {
        try {
            if (!decodedToken || !token) {
                console.error("No valid token found");
                return;
            }

            const formData = new FormData();
            formData.append('profilePhoto', photoFile);

            const response = await fetch(
                `${backendUrl}/user/profilephoto?id=${decodedToken.userId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                console.log(response);
                console.error("Error updating profile photo:", response.statusText);
                alert("Error updating profile photo: " + response.statusText);
                return;
            }

            const result = await response.json();
            if (result.isError) {
                alert("Error uploading profile photo: " + result.message);
            } else {
                alert("Profile photo updated successfully!");
                setProfile({
                    ...profile,
                    photo: result.photoUrl || profile.photo
                });
            }
        } catch (error) {
            console.log("Error:", error);
            alert("An error occurred while updating the profile photo.");
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Profile Card */}
                <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600"></div>

                    {/* Profile Info */}
                    <div className="bg-white dark:bg-gray-800 p-5 pt-0">
                        <div className="flex flex-col items-center md:flex-row md:items-end md:justify-between">
                            <div className="flex flex-col md:flex-row items-center">
                                {/* Profile Image - Fixed positioning */}
                                <div className="relative group -mt-16 mb-4 md:mb-0 md:mr-6">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
                                        <img
                                            src={profile.photo || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"}
                                            alt="Profile Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div
                                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                        onClick={() => setIsPhotoModalOpen(true)}
                                    >
                                        <FaPencilAlt className="text-white text-xl" />
                                    </div>
                                </div>

                                {/* User Details - Added more top margin for better spacing */}
                                <div className="text-center md:text-left mt-2 md:mt-0">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                                    <div className="flex flex-col md:flex-row md:items-center text-gray-600 dark:text-gray-300 mt-1">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">{profile.role}</span>
                                        {profile.studentId && (
                                            <span className="mt-1 md:mt-0 md:ml-2 text-sm">{profile.studentId}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                            >
                                Edit Profile
                            </button>
                        </div>

                        {/* Points Display */}
                        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-indigo-100">Total Points</p>
                                    <p className="text-3xl font-bold">{profile.TotalPoints}</p>
                                </div>
                                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="text-2xl font-bold">{profile.TotalPoints > 0 ? '🏆' : '🎯'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Grid */}
                        <div className="mt-6">
                            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Contact Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { icon: <FaEnvelope className="text-indigo-500" />, label: "Email", value: profile.email, isEmail: true },
                                    { icon: <FaPhone className="text-violet-500" />, label: "Phone", value: profile.phone, isPhone: true },
                                    { icon: <FaLinkedin className="text-indigo-500" />, label: "LinkedIn", value: profile.linkedin, isLink: true },
                                    { icon: <SiLeetcode className="text-violet-500" />, label: "Leetcode", value: profile.Leetcode, isLink: true },
                                    { icon: <FaInstagram className="text-indigo-500" />, label: "Instagram", value: profile.instagram, isLink: true },
                                    { icon: <FaGithub className="text-violet-500" />, label: "GitHub", value: profile.github, isLink: true },
                                ]
                                    .filter(item => item.value)
                                    .map((item, index) => (
                                        <ContactItem
                                            key={index}
                                            icon={item.icon}
                                            label={item.label}
                                            value={item.value}
                                            isLink={item.isLink}
                                            isEmail={item.isEmail}
                                            isPhone={item.isPhone}
                                        />
                                    ))
                                }
                            </div>
                        </div>
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

            {isPhotoModalOpen && (
                <PhotoUploadModal
                    currentPhoto={profile.photo}
                    onSave={updateProfilePhoto}
                    onClose={() => setIsPhotoModalOpen(false)}
                />
            )}
        </div>
    );
};

const ContactItem = ({ icon, label, value, isLink, isEmail, isPhone }) => {
    if (!value) return null;

    let href = value;
    if (isEmail) href = `mailto:${value}`;
    if (isPhone) href = `tel:${value}`;
    if (isLink) {
        if (label === "LinkedIn") href = `https://www.linkedin.com/in/${value}`;
        if (label === "Leetcode") href = `https://leetcode.com/${value}`;
        if (label === "Instagram") href = `https://www.instagram.com/${value}`;
        if (label === "GitHub") href = `https://github.com/${value}`;
    }

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                {isLink || isEmail || isPhone ? (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
                )}
            </div>
        </div>
    );
};

const PhotoUploadModal = ({ currentPhoto, onSave, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentPhoto);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedFile) {
            onSave(selectedFile);
            onClose();
        } else {
            alert("Please select an image first.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Update Profile Photo</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <div className="flex justify-center mb-4">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700">
                                <img
                                    src={previewUrl || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"}
                                    alt="Profile Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyProfile;
