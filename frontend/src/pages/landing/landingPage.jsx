import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {useDarkMode} from "../../context/ThemeContext";
import {useLocation, useNavigate} from "react-router-dom";

const clubs = [
    {
        name: "Electrogeeks",
        description: "Robotics Club of IIIT Raichur.",
        email: "electrogeeks@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/electrogeeks-inverted.png",
    },
    {
        name: "Codesoc",
        description: "Coding club of IIIT Raichur",
        email: "code_soc@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/codesoc-inverted.png",
    },
    {
        name: "Finesse",
        description: "The Cultural Club",
        email: "finesse@students.iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/finesse-inverted.png",
    },
    {
        name: "Finspiration",
        description: "Finance Club",
        email: "finspiration@students.iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/finspiration-inverted…",
    },
    {
        name: "Xposure",
        description: "Photography Club",
        email: "xposure@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/xposure-inverted.png",
    },
    {
        name: "NSO",
        description: "",
        email: "sports@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/nso-inverted.png",
    },
    {
        name: "NSS",
        description: "",
        email: "nss@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/nss-inverted.png",
    },
    {
        name: "EBSB",
        description: "",
        email: "ebsb@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/ebsb-inverted.png",
    },
    {
        name: "Stage&Studio",
        description: "Dance drama and drawing Club",
        email: "d3@students.iiitr.ac.in",
        image: "https://i.postimg.cc/PJMsKvnc/Stage-Studio-Logo.png",
    },
    {
        name: "E-HaCs",
        description: "Cyber Security and Ethical Hacking Society",
        email: "E-HaCs@students.iiitr.ac.in",
        image: "https://i.ibb.co/hCLr1sf/EHa-CS-Logo.jpg",
    },
    {
        name: "Deep-Labs",
        description: "AIML Society",
        email: "deep_labs@students.iiitr.ac.in",
        image: "https://i.ibb.co/XVz1zJ8/Deep-Labs-logo.png",
    },
    {
        name: "DevX",
        description: "Web/app development society",
        email: "DevX@students.iiitr.ac.in",
        image: "https://i.ibb.co/R7KhDVV/devx-logo.png",
    }
];

const LeaderboardLanding = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();  // Access dark mode state
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [visibleClubs, setVisibleClubs] = useState(3);
    const [activeClub, setActiveClub] = useState(null);
    const navigate = useNavigate();

    const updateVisibleClubs = () => {
        if (window.innerWidth <= 640) {
            setVisibleClubs(1);
        } else if (window.innerWidth <= 1024) {
            setVisibleClubs(2);
        } else {
            setVisibleClubs(3);
        }
    };

    useEffect(() => {
        updateVisibleClubs();
        window.addEventListener('resize', updateVisibleClubs);

        return () => {
            window.removeEventListener('resize', updateVisibleClubs);
        };
    }, []);

    return (
        <>
            <iframe
                src={isDarkMode ? "./background-dark.html" : "./background.html"}  // Dynamically change background HTML file based on dark mode
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "200vh",
                    border: "none",
                    zIndex: -1,
                }}
                title="Background Design"
            />
            <div className={`min-h-screen ${isDarkMode ? './background-dark.html text-white' : './background.html text-black'} relative`}>
                {/* Header */}
                <div className={`flex items-center fixed top-6 left-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    <img
                        src="https://yt3.ggpht.com/7Zr32gutPw-f4966pWFhWUa1v07iwzqbtOoWnhnAlrRxYbh9vUboLAfu90lAVRxuIjhyevbb=s68-c-k-c0x00ffffff-no-rj"
                        alt="IIITR Logo"
                        className="w-12 h-12 rounded-full"
                    />
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-mirage-50' : 'text-mirage-950'} ml-4`}>
                        League of IIITR
                    </h1>
                </div>
                <div className="absolute top-6 right-6">
                    <button
                        onClick={() =>navigate('/login')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        Login
                    </button>
                </div>

                <div className="text-2xl flex justify-center items-center h-screen">
                    <h1 className={`text-9xl font-sans font-bold text-center ${isDarkMode ? 'text-mirage-50' : 'text-mirage-950'}`}>
                        League of IIITR
                    </h1>
                </div>

                {/* 3D Clubs Slider */}
                <div className="min-h-screen p-6">
                    <div className="container mx-auto">
                        <h2 className={`text-4xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-black'} mb-12`}>
                            Our Clubs
                        </h2>
                        <motion.div
                            style={{
                                overflowX: "scroll",
                                scrollbarWidth: "thin", // Firefox: makes the scrollbar thinner
                                scrollbarColor: "#4672b1 #253555", // Firefox: thumb and track colors
                            }}
                            className="flex pb-10 scroll-smooth snap-x styled-scrollbar"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <style>
                                {`
                                    /* WebKit browsers (Chrome, Safari, etc.) */
                                    .styled-scrollbar::-webkit-scrollbar {
                                        height: 8px; /* Height for horizontal scrollbar */
                                    }

                                    .styled-scrollbar::-webkit-scrollbar-track {
                                        background: ${isDarkMode ? '#253555' : '#e2e2e2'}; /* Track color */
                                        border-radius: 4px;
                                    }

                                    .styled-scrollbar::-webkit-scrollbar-thumb {
                                        background-color: #4672b1; /* Thumb color */
                                        border-radius: 4px;
                                    }

                                    .styled-scrollbar::-webkit-scrollbar-thumb:hover {
                                        background-color: #6990c7; /* Thumb color on hover */
                                    }
                                `}
                            </style>

                            <div className="flex gap-8 mx-auto">
                                {clubs.map((club, index) => (
                                    <motion.div
                                        key={club.name}
                                        className={`relative group transition-all duration-300 ease-in-out
                                            w-72 min-w-[18rem] p-6 rounded-2xl
                                            ${activeClub === club.name
                                            ? 'scale-105 shadow-2xl bg-mirage-500/70 border-2 border-mirage-600'
                                            : 'scale-95 bg-mirage-400/50 hover:bg-mirage-400/70'}
                                            snap-center cursor-pointer
                                        `}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveClub(club.name)}
                                        onMouseEnter={() => setActiveClub(club.name)}
                                        onMouseLeave={() => setActiveClub(null)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-mirage-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-center mb-6">
                                                <img
                                                    src={club.image}
                                                    alt={`${club.name} Logo`}
                                                    className={`w-32 h-32 rounded-full object-cover
                                                        transition-all duration-300
                                                        ${activeClub === club.name
                                                        ? 'border-4 border-mirage-600 shadow-lg'
                                                        : 'border-2 border-mirage-900'}
                                                    `}
                                                />
                                            </div>
                                            <h2 className={`text-3xl font-bold text-center mb-4
                                                ${activeClub === club.name
                                                ? 'text-mirage-200'
                                                : 'text-mirage-300'}
                                                transition-colors duration-300
                                            `}>
                                                {club.name}
                                            </h2>
                                            <p className={`text-center text-sm
                                                ${activeClub === club.name
                                                ? 'text-mirage-50'
                                                : 'text-mirage-800'}
                                                transition-colors duration-300
                                            `}>
                                                {club.description}
                                            </p>
                                            <p className={`text-center text-sm
                                                ${activeClub === club.name
                                                ? 'text-mirage-50'
                                                : 'text-mirage-800'}
                                                transition-colors duration-300
                                            `}>
                                                {club.email}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Dark Mode Toggle */}
                <button onClick={toggleDarkMode} className="fixed bottom-10 right-10 bg-blue-600 text-white p-4 rounded-full">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>

                {/* Footer */}
                <footer className="bg-gray-800 p-6 text-center">
                    <p className="text-gray-400">
                        2024 League of IIITR
                    </p>
                </footer>
            </div>
        </>
    );
};

export default LeaderboardLanding;