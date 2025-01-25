import React, { useEffect, useState } from "react";
import { FaEnvelope, FaGithub, FaInstagram, FaLinkedin, FaPhone, FaTwitter } from "react-icons/fa";
import { useParams } from "react-router-dom"; // To get the 'id' from the URL
import PastParticipants from "../home/PastParticipants";

const OtherMembers = () => {
    const { id } = useParams(); // Extracting the 'id' from the URL parameter
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
        twitter: "",
        instagram: "",
        github: "",
    });
    const studentId = id;

    // Fetch profile details based on the 'id'
    const fetchProfileDetails = async () => {
        try {
            console.log("id ", id);
            const response = await fetch(`http://localhost:4000/user/profile?id=${id}`,
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

    useEffect(() => {
        fetchProfileDetails();
    }, [id]); // Fetch new profile when 'id' changes

    return (
        <div className="min-h-screen p-8 bg-mirage-50 dark:bg-mirage-950">
            <div className="p-6 rounded-lg shadow-md bg-mirage-200 dark:bg-mirage-800">
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6 w-full">
                        <img
                            src={profile.photo || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"}
                            alt="Profile Avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-mirage-100 dark:border-mirage-700"
                        />
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-mirage-900 dark:text-mirage-50">{profile.name}</h1>
                                    <p className="text-lg text-mirage-700 dark:text-mirage-200">{profile.role}</p>
                                    <p className="text-lg text-mirage-700 dark:text-mirage-200">{profile.studentId}</p>
                                </div>
                                <div className="bg-mirage-100 dark:bg-mirage-900 p-4 rounded-lg flex flex-col items-center justify-center h-24 w-32">
                                    <p className="text-sm text-mirage-700 dark:text-mirage-200 mb-2 text-center">Total Points</p>
                                    <p className="text-4xl font-bold text-mirage-900 dark:text-mirage-50 text-center">{profile.TotalPoints}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border">
                    <PastParticipants studentId={studentId} />
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

export default OtherMembers;