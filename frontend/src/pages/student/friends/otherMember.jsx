import React, { useEffect, useState } from "react";
import { FaEnvelope, FaGithub, FaInstagram, FaLinkedin, FaPhone } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { useParams } from "react-router-dom";
import PastParticipants from "../home/PastParticipants";
import { backendUrl } from "../../../utils/routes";

const OtherMembers = () => {
    const { id } = useParams();
    const token = localStorage.getItem("jwtToken");
    const [profile, setProfile] = useState({
        name: "",
        role: "",
        studentId: "",
        TotalPoints: 0,
        photo: "",
        linkedin: "",
        email: "",
        phone: "",
        Leetcode: "",
        instagram: "",
        github: "",
    });

    const fetchProfileDetails = async () => {
        try {
            const response = await fetch(`${backendUrl}/user/profile?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
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

    useEffect(() => {
        fetchProfileDetails();
    }, [id]);

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Profile Card */}
                <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600"></div>

                    {/* Profile Info */}
                    <div className="bg-white dark:bg-gray-800 p-5 pt-0">
                        <div className="flex flex-col md:flex-row items-center md:items-end md:justify-between">
                            <div className="flex flex-col md:flex-row items-center">
                                {/* Profile Image */}
                                <div className="relative -mt-16 mb-4 md:mb-0 md:mr-6">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
                                        <img
                                            src={profile.photo || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"}
                                            alt="Profile Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* User Details */}
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

                            {/* Points Display Card */}
                            <div className="mt-4 md:mt-0 px-5 py-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <div className="text-xs font-medium text-indigo-800 dark:text-indigo-200">Total Points</div>
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{profile.TotalPoints}</div>
                            </div>
                        </div>

                        {/* Points Display Banner */}
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

                        {/* Past Participants Section */}
                        <div className="mt-6">
                            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Activity History</h2>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
                                <PastParticipants studentId={id} />
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

export default OtherMembers;