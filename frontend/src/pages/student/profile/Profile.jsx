import React, { useEffect, useState } from "react";
import { FaEnvelope, FaGithub, FaInstagram, FaLinkedin, FaPhone,FaPencilAlt } from "react-icons/fa";
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
        LeeTrack:"",
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
        <div className="min-h-screen p-4 md:p-8 bg-mirage-50 dark:bg-mirage-950">
            <div className="p-4 md:p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative group">
                            <img
                                src={profile.photo || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"}
                                alt="Profile Avatar"
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-mirage-100 dark:border-mirage-700"
                            />
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                onClick={() => setIsPhotoModalOpen(true)}
                            >
                                <FaPencilAlt className="text-white text-xl" />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold text-mirage-900 dark:text-mirage-50">{profile.name}</h1>
                            <p className="text-sm md:text-lg text-mirage-700 dark:text-mirage-200">{profile.role}</p>
                            <p className="text-sm md:text-lg text-mirage-700 dark:text-mirage-200">{profile.studentId}</p>
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
                <div className="mb-6 md:mb-8 p-4 md:p-6 rounded-lg bg-mirage-100 dark:bg-mirage-900">
                    <div className="text-center">
                        <p className="text-4xl md:text-6xl font-bold text-mirage-900 dark:text-mirage-50">{profile.TotalPoints}</p>
                        <p className="text-sm text-mirage-700 dark:text-mirage-200 mt-2">Total Points</p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="p-4 md:p-6 rounded-lg bg-mirage-100 dark:bg-mirage-900">
                    <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-mirage-900 dark:text-mirage-50">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <ContactItem icon={<FaLinkedin />} label="LinkedIn" value={profile.linkedin} isLink />
                        <ContactItem icon={<FaEnvelope />} label="Email" value={profile.email} isEmail />
                        <ContactItem icon={<FaPhone />} label="Phone" value={profile.phone} isPhone />
                        <ContactItem icon={<SiLeetcode />} label="Leetcode" value={profile.Leetcode} isLink />
                        <ContactItem icon={<FaInstagram />} label="Instagram" value={profile.instagram} isLink />
                        <ContactItem icon={<FaGithub />} label="GitHub" value={profile.github} isLink />
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
        <div className="flex items-center gap-4 p-3 rounded-lg bg-mirage-200 dark:bg-mirage-800">
            <div className="text-lg text-mirage-700 dark:text-mirage-200">{icon}</div>
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
            <div className="bg-white dark:bg-mirage-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-mirage-900 dark:text-mirage-50">Update Profile Photo</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <div className="flex justify-center mb-4">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-mirage-100 dark:border-mirage-700">
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
                            className="w-full p-2 border border-gray-300 rounded dark:bg-mirage-700 dark:border-mirage-600"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-mirage-700 rounded-lg hover:bg-gray-300 dark:hover:bg-mirage-600 text-gray-800 dark:text-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 text-white"
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
