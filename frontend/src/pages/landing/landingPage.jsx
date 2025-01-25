import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [bgColor, setBgColor] = useState('text-blue-400'); // Default color for the center text
    const [visibleClubs, setVisibleClubs] = useState(3);
    const [activeClub, setActiveClub] = useState(null);


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
                src="./background.html"
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
            <div className="min-h-screen text-white">
                {/* Header */}
                <div className={`flex items-center fixed top-6 left-6 text-black`}>
                    <img
                        src="https://yt3.ggpht.com/7Zr32gutPw-f4966pWFhWUa1v07iwzqbtOoWnhnAlrRxYbh9vUboLAfu90lAVRxuIjhyevbb=s68-c-k-c0x00ffffff-no-rj"
                        alt="IIITR Logo"
                        className="w-12 h-12 rounded-full"
                    />
                    <h1 className={`text-2xl font-bold text-black`}>
                        League of IIITR
                    </h1>
                </div>
                <div className="absolute top-6 right-6">
                    <button
                        onClick={() => setIsLoginOpen(!isLoginOpen)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        Login
                    </button>
                </div>

                <div className="text-2xl flex justify-center items-center h-screen">
                    <h1 className="text-6xl font-bold text-center text-blue-400">
                        League of IIITR
                    </h1>
                </div>

                {/* 3D Clubs Slider */}
                <div className="min-h-screen p-6">
                    <div className="container mx-auto">
                        <h2 className="text-4xl font-bold text-center text-white mb-12">Our Clubs</h2>
                        <motion.div
                            className="flex overflow-x-scroll pb-10 hide-scrollbar scroll-smooth snap-x"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex gap-8 mx-auto">
                                {clubs.map((club, index) => (
                                    <motion.div
                                        key={club.name}
                                        className={`
                                        relative group transition-all duration-300 ease-in-out
                                        w-72 min-w-[18rem] p-6 rounded-2xl 
                                        ${activeClub === club.name
                                                ? 'scale-105 shadow-2xl bg-blue-900/70 border-2 border-blue-500'
                                                : 'scale-95 bg-gray-800/50 hover:bg-gray-800/70'}
                                        snap-center cursor-pointer
                                    `}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveClub(club.name)}
                                        onMouseEnter={() => setActiveClub(club.name)}
                                        onMouseLeave={() => setActiveClub(null)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-center mb-6">
                                                <img
                                                    src={club.image}
                                                    alt={`${club.name} Logo`}
                                                    className={`
                                                    w-32 h-32 rounded-full object-cover 
                                                    transition-all duration-300
                                                    ${activeClub === club.name
                                                            ? 'border-4 border-blue-500 shadow-lg'
                                                            : 'border-2 border-gray-700'}
                                                `}
                                                />
                                            </div>
                                            <h2 className={`
                                            text-3xl font-bold text-center mb-4
                                            ${activeClub === club.name
                                                    ? 'text-blue-300'
                                                    : 'text-gray-300'}
                                            transition-colors duration-300
                                        `}>
                                                {club.name}
                                            </h2>
                                            <p className={`
                                            text-center text-sm
                                            ${activeClub === club.name
                                                    ? 'text-blue-100'
                                                    : 'text-gray-400'}
                                            transition-colors duration-300
                                        `}>
                                                {club.description}
                                            </p>
                                            <p className={`
                                            text-center text-sm
                                            ${activeClub === club.name
                                                    ? 'text-blue-100'
                                                    : 'text-gray-400'}
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
                {/* Footer */}
                <footer className="bg-gray-800 p-6 text-center">
                    <p className="text-gray-400">
                        © 2024 League of IIITR. All Rights Reserved.
                    </p>
                </footer>
            </div>
        </>
    );
};

export default LeaderboardLanding;
