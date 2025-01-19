import React, {useState} from "react";
import {FaEnvelope, FaGithub, FaInstagram, FaLinkedin, FaPhone, FaTwitter} from "react-icons/fa"; // Importing Font Awesome icons

const ProfileSection = () => {
    const [profile, setProfile] = useState({
        name: "SARTHAK JAIN",
        role: "Gamer",
        location: "IIIT Raichur",
        event_attended: 45,
        Ranking: 132,
        Points: 548,
        contact: {
            linkedin: "https://www.linkedin.com/in/sarthakjain",
            email: "sarthakjain@example.com",
            phone: "+91 123 456 7890",
            twitter: "https://twitter.com/sarthakjain",
            instagram: "https://www.instagram.com/sarthakjain",
            github: "https://github.com/sarthakjain",
        },
    });

    return (
        <div
            className={`max-w-7xl mx-auto p-6 rounded-lg shadow-lg transition-colors duration-300 dark:bg-gray-800 dark:text-white bg-white text-gray-800 `}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <img
                        src="https://imgs.search.brave.com/q17txzW8QFYfr4niM-SFoM4tEkzDX0UrqThxZlOdleo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnJl/ZGQuaXQvdzVrenRk/dDNveWNlMS5qcGVn"
                        alt="Profile Avatar"
                        className="w-32 h-32 rounded-full object-cover"
                    />
                    <div>
                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">{profile.role}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Based in {profile.location}</p>
                    </div>
                </div>
            </div>
            <br></br>
            <div className="mt-6 grid grid-cols-3 gap-6 text-center">
                <div>
                    <p className="text-6xl font-bold">{profile.Ranking}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ranking</p>
                </div>
                <div>
                    <p className="text-6xl font-bold">{profile.event_attended}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Event Attended</p>
                </div>
                <div>
                    <p className="text-6xl font-bold">{profile.Points}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-400">Points</p>
                </div>
            </div>

            {/* Information Section */}
            <div className="mt-10">
                <h2 className="text-xl font-bold mb-4"></h2>
                <br></br>
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                        <FaLinkedin className="text-blue-600 text-xl"/>
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
                        <FaEnvelope className="text-blue-600 text-xl"/>
                        <a href={`mailto:${profile.contact.email}`} className="dark:text-white text-gray-800">
                            Email
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <FaPhone className="text-blue-600 text-xl"/>
                        <a href={`tel:${profile.contact.phone}`} className="dark:text-white text-gray-800">
                            {profile.contact.phone}
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <FaTwitter className="text-blue-600 text-xl"/>
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
                        <FaInstagram className="text-blue-600 text-xl"/>
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
                        <FaGithub className="text-blue-600 text-xl"/>
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
        </div>
    );
};

export default ProfileSection;
