import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet'; // Import React Helmet for SEO

// Import necessary icons
import { Home, LogIn, Sun, Moon, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const clubs = [
    {
        name: "Electrogeeks",
        description: "Robotics Club of IIIT Raichur.",
        email: "electrogeeks@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/electrogeeks-inverted.png",
        color: "#3498db", // Blue
        website: "https://students.iiitr.ac.in/clubs/electrogeeks"
    },
    {
        name: "Codesoc",
        description: "Coding club of IIIT Raichur",
        email: "code_soc@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/codesoc-inverted.png",
        color: "#2ecc71", // Green
        website: "https://students.iiitr.ac.in/clubs/codesoc"
    },
    {
        name: "Finesse",
        description: "The Cultural Club",
        email: "finesse@students.iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/finesse-inverted.png",
        color: "#e74c3c", // Red
        website: "https://students.iiitr.ac.in/clubs/finesse"
    },
    {
        name: "Finspiration",
        description: "Finance Club",
        email: "finspiration@students.iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/finspiration-inverted.png",
        color: "#f39c12", // Orange
        website: "https://students.iiitr.ac.in/clubs/finspiration"
    },
    {
        name: "Xposure",
        description: "Photography Club",
        email: "xposure@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/xposure-inverted.png",
        color: "#9b59b6", // Purple
        website: "https://students.iiitr.ac.in/clubs/xposure"
    },
    {
        name: "NSO",
        description: "National Sports Organization",
        email: "sports@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/nso-inverted.png",
        color: "#1abc9c", // Teal
        website: "https://students.iiitr.ac.in/clubs/nso"
    },
    {
        name: "NSS",
        description: "National Service Scheme",
        email: "nss@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/nss-inverted.png",
        color: "#d35400", // Dark Orange
        website: "https://students.iiitr.ac.in/clubs/nss"
    },
    {
        name: "EBSB",
        description: "Ek Bharat Shreshtha Bharat",
        email: "ebsb@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/ebsb-inverted.png",
        color: "#27ae60", // Dark Green
        website: "https://students.iiitr.ac.in/clubs/ebsb"
    },
    {
        name: "Stage&Studio",
        description: "Dance drama and drawing Club",
        email: "d3@students.iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/S&S_Logo.png",
        color: "#8e44ad", // Dark Purple
        website: "https://students.iiitr.ac.in/clubs/stagenstudio"
    },
    {
        name: "E-HaCs",
        description: "Cyber Security and Ethical Hacking Society",
        email: "E-HaCs@students.iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/EHaCS_Logo.jpg",
        color: "#2980b9", // Dark Blue
        website: "https://students.iiitr.ac.in/clubs/ehacs"
    },
    {
        name: "Deep-Labs",
        description: "AIML Society",
        email: "deep_labs@students.iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/Deep_Labs_logo.png",
        color: "#c0392b", // Dark Red
        website: "https://students.iiitr.ac.in/clubs/deeplabs"
    },
    {
        name: "DevX",
        description: "Web/app development society",
        email: "DevX@students.iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/DevX_logo.png",
        color: "#16a085", // Dark Teal
        website: "https://students.iiitr.ac.in/clubs/devx"
    },
    {
        name: "Game Xcellence",
        description: "Gaming and eSports society",
        email: "gamex@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/GameXcellence_logo.png",
        color: "#7d3c98", // Deep Purple
        website: "https://students.iiitr.ac.in/clubs/gamexcellence"
    },
    {
        name: "ECell",
        description: "Entrepreneurship and startup incubation society",
        email: "ecell@iiitr.ac.in",
        image: "https://students.iiitr.ac.in/assets/images/club/E_cell_logo.jpg",
        color: "#2c3e50", // Dark Slate
        website: "https://students.iiitr.ac.in/clubs/ecell"
    }
];

const LeaderboardLanding = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Check screen size for responsive design
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Auto-scroll clubs carousel
    useEffect(() => {
        if (isScrolling) return;

        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % clubs.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isScrolling]);

    // Handle club navigation
    const handleNextClub = () => {
        setIsScrolling(true);
        setActiveIndex((prevIndex) => (prevIndex + 1) % clubs.length);
        setTimeout(() => setIsScrolling(false), 1000);
    };

    const handlePrevClub = () => {
        setIsScrolling(true);
        setActiveIndex((prevIndex) => (prevIndex - 1 + clubs.length) % clubs.length);
        setTimeout(() => setIsScrolling(false), 1000);
    };

    // Calculate visible clubs based on window size
    const getVisibleClubs = () => {
        const currentIndex = activeIndex;
        if (isMobile) {
            return [clubs[currentIndex]];
        }

        return [
            clubs[currentIndex],
            clubs[(currentIndex + 1) % clubs.length],
            clubs[(currentIndex + 2) % clubs.length]
        ];
    };

    const handleHomePage = () => {
        const token = localStorage.getItem("authToken");
        const role = localStorage.getItem("role");
        if (token) {
            if (role === "student") {
                navigate("/home");
            } else if (role === "coordinator") {
                navigate("/dashboard");
            } else if (role === "admin") {
                navigate("/admin");
            } else {
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    };

    // Get gradient based on theme
    const getGradient = () => {
        return isDarkMode
            ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-b from-blue-50 via-white to-blue-50';
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'} relative`}>
            {/* SEO Optimization */}
            <Helmet>
                <title>League of IIITR - Connect with Clubs & Events at IIIT Raichur</title>
                <meta name="description" content="Explore and connect with clubs, participate in events, and join the vibrant community of IIIT Raichur through the League of IIITR platform." />
                <meta name="keywords" content="IIIT Raichur, clubs, student activities, college events, Electrogeeks, Codesoc, Finesse, campus life, IIITR" />
                <meta property="og:title" content="League of IIITR - Campus Clubs & Events" />
                <meta property="og:description" content="Join IIIT Raichur's vibrant community. Connect with clubs, participate in events, and showcase your talents." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="https://tnp.iiitr.ac.in/static/media/logo.393f38abf77d5c6149ab.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href={window.location.href} />
                <meta name="robots" content="index, follow" />
            </Helmet>

            {/* Modern Particle Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 opacity-20 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
                            style={{
                                width: Math.random() * 10 + 5,
                                height: Math.random() * 10 + 5,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                x: [0, Math.random() * 100 - 50],
                                y: [0, Math.random() * 100 - 50],
                            }}
                            transition={{
                                duration: Math.random() * 10 + 20,
                                repeat: Infinity,
                                repeatType: "reverse",
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Header with Navigation */}
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-md shadow-md`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo and Site Title */}
                        <div className="flex items-center space-x-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
                                <img
                                    src="https://tnp.iiitr.ac.in/static/media/logo.393f38abf77d5c6149ab.png"
                                    alt="IIITR Logo"
                                    className="w-8 h-8 object-contain"
                                />
                                <div className="absolute inset-0 rounded-full border-2 border-blue-500 opacity-10"></div>
                            </div>
                            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                League of IIITR
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleHomePage}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDarkMode
                                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                    } transition-all`}
                            >
                                <Home size={18} />
                                <span>Dashboard</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDarkMode
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } transition-all`}
                            >
                                <LogIn size={18} />
                                <span>Login</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleDarkMode}
                                className={`p-2 rounded-full ${isDarkMode
                                    ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                    } transition-all`}
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </motion.button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}
                            >
                                <span className="block w-6 h-0.5 bg-current mb-1.5"></span>
                                <span className="block w-6 h-0.5 bg-current mb-1.5"></span>
                                <span className="block w-6 h-0.5 bg-current"></span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {showMobileMenu && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`md:hidden overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
                                <button
                                    onClick={() => {
                                        handleHomePage();
                                        setShowMobileMenu(false);
                                    }}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                        } transition-all`}
                                >
                                    <Home size={18} />
                                    <span>Dashboard</span>
                                </button>

                                <button
                                    onClick={() => {
                                        navigate('/login');
                                        setShowMobileMenu(false);
                                    }}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${isDarkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        } transition-all`}
                                >
                                    <LogIn size={18} />
                                    <span>Login</span>
                                </button>

                                <button
                                    onClick={() => {
                                        toggleDarkMode();
                                        setShowMobileMenu(false);
                                    }}
                                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg ${isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                                        : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                        } transition-all`}
                                >
                                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Hero Section with Advanced Animation */}
            <section className="relative pt-32 lg:pl-12 pb-0 min-h-screen flex items-center">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center">
                        <motion.div
                            className="md:w-1/2 text-center md:text-left mb-12 md:mb-0"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.h1
                                className={`text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 
                                    ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <span className="block">Welcome to the</span>
                                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                    League of IIITR
                                </span>
                            </motion.h1>

                            <motion.p
                                className={`text-xl mb-8 max-w-lg mx-auto md:mx-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                Explore, connect, and participate with the vibrant clubs and societies of IIIT Raichur.
                            </motion.p>

                            <motion.div
                                className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleHomePage}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                                >
                                    Dashboard
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/login')}
                                    className={`px-8 py-3 rounded-lg font-medium
                                        ${isDarkMode
                                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} 
                                        transition-all`}
                                >
                                    Login
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative h-64 sm:h-80 md:h-96 w-full">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full 
                                        ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'} 
                                        flex items-center justify-center overflow-hidden`}
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                            className="absolute inset-0"
                                        >
                                            {[...Array(8)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="absolute w-3 h-3 rounded-full bg-blue-500"
                                                    style={{
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: `rotate(${i * 45}deg) translateY(-100px)`,
                                                    }}
                                                />
                                            ))}
                                        </motion.div>

                                        <motion.div
                                            className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full z-10 bg-white flex items-center justify-center overflow-hidden shadow-lg"
                                            animate={{
                                                scale: [1, 1.05, 1],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 3,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <motion.img
                                                src="https://tnp.iiitr.ac.in/static/media/logo.393f38abf77d5c6149ab.png"
                                                alt="IIITR Logo"
                                                className="w-24 h-24 sm:w-36 sm:h-36 object-contain"
                                            />
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-20"
                                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 3,
                                                    ease: "easeInOut"
                                                }}
                                            ></motion.div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            className={`rounded-2xl p-10 ${isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white shadow-2xl`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex flex-col md:flex-row items-center justify-between">
                                <div className="md:w-2/3 mb-8 md:mb-0 text-center md:text-left">
                                    <h2 className="text-3xl font-bold mb-4">Ready to Join the League?</h2>
                                    <p className="text-lg opacity-90 mb-6">
                                        Become part of IIIT Raichur's vibrant community today and unlock endless opportunities.
                                    </p>
                                </div>
                                <div className="md:w-1/3 flex justify-center md:justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/login')}
                                        className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-all shadow-md"
                                    >
                                        Register Now
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Advanced Clubs Showcase */}
            <section className={`py-20 ${getGradient()}`}>
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Discover Our Vibrant Clubs
                        </h2>
                        <p className={`max-w-2xl mx-auto text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Join and participate in IIIT Raichur's diverse community of clubs and organizations.
                        </p>
                    </motion.div>

                    {/* Club Carousel Controls */}
                    <div className="flex justify-center mb-8">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePrevClub}
                            className={`mx-2 p-3 rounded-full ${isDarkMode
                                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                } transition-all`}
                        >
                            <ChevronLeft size={20} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNextClub}
                            className={`mx-2 p-3 rounded-full ${isDarkMode
                                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                } transition-all`}
                        >
                            <ChevronRight size={20} />
                        </motion.button>
                    </div>

                    {/* Advanced Club Cards Carousel */}
                    <div className="relative overflow-hidden py-8">
                        <motion.div
                            className="flex flex-wrap justify-center gap-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {getVisibleClubs().map((club, idx) => (
                                <motion.div
                                    key={club.name}
                                    className={`w-full sm:w-72 rounded-2xl overflow-hidden shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                                        }`}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.2, duration: 0.6 }}
                                    whileHover={{
                                        y: -10,
                                        boxShadow: isDarkMode
                                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                    }}
                                >
                                    <div
                                        className="h-32 p-4 flex items-center justify-center"
                                        style={{ backgroundColor: club.color }}
                                    >
                                        <div className="w-full relative h-full flex items-center justify-center">
                                            <img
                                                src={club.image}
                                                alt={`${club.name} Logo`}
                                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://via.placeholder.com/150?text=" + club.name;
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Club Card Content */}
                                    <div className="py-6 px-6">
                                        <h3 className={`text-xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {club.name}
                                        </h3>
                                        <p className={`text-center text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {club.description}
                                        </p>
                                        <div className={`text-center text-xs mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {club.email}
                                        </div>

                                        {/* Club Action Buttons */}
                                        <div className="flex justify-center">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => window.open(club.website, '_blank')}
                                                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 transition-all"
                                            >
                                                <span>View Details</span>
                                                <ExternalLink size={14} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Club Navigation Indicators */}
                    <div className="flex justify-center mt-10">
                        {clubs.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setIsScrolling(true);
                                    setActiveIndex(idx);
                                    setTimeout(() => setIsScrolling(false), 1000);
                                }}
                                className={`w-2 h-2 mx-1 rounded-full transition-all ${idx === activeIndex
                                    ? isDarkMode
                                        ? 'bg-blue-500 w-6'
                                        : 'bg-blue-600 w-6'
                                    : isDarkMode
                                        ? 'bg-gray-700'
                                        : 'bg-gray-300'
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits/Features Section */}
            <section className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Why Join the League?
                        </h2>
                        <p className={`max-w-2xl mx-auto text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Experience the benefits of being part of IIIT Raichur's vibrant community.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Connect & Network",
                                description: "Build valuable relationships with peers, faculty, and industry professionals.",
                                icon: "👥"
                            },
                            {
                                title: "Develop Skills",
                                description: "Enhance your technical and soft skills through hands-on projects and team activities.",
                                icon: "🚀"
                            },
                            {
                                title: "Showcase Talent",
                                description: "Participate in events, competitions, and showcase your unique abilities.",
                                icon: "🏆"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                                    } text-center relative overflow-hidden`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2, duration: 0.6 }}
                                whileHover={{
                                    scale: 1.03,
                                    boxShadow: isDarkMode
                                        ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                                        : '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
                                }}
                            >
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`}></div>
                                <div className="mb-4">
                                    <span className="text-4xl">{feature.icon}</span>
                                </div>
                                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {feature.title}
                                </h3>
                                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white`}>
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md mr-3">
                                    <img
                                        src="https://tnp.iiitr.ac.in/static/media/logo.393f38abf77d5c6149ab.png"
                                        alt="IIITR Logo"
                                        className="w-8 h-8 object-contain"
                                    />
                                    <div className="absolute inset-0 rounded-full border-2 border-blue-500 opacity-10"></div>
                                </div>
                                <h3 className="text-xl font-bold">League of IIITR</h3>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Connecting clubs and students across the IIIT Raichur campus.
                            </p>
                        </div>

                        {/* <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Clubs</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Events</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a></li>
                            </ul>
                        </div> */}

                        {/* <div>
                            <h4 className="text-lg font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                            </ul>
                        </div> */}

                        {/* <div>
                            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
                            <div className="flex space-x-4 mb-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors">
                                    <span className="sr-only">Facebook</span>
                                    
                                    f
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-400 transition-colors">
                                    <span className="sr-only">Twitter</span>
                                  
                                    t
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-pink-600 transition-colors">
                                    <span className="sr-only">Instagram</span>
                                  
                                    i
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-800 transition-colors">
                                    <span className="sr-only">LinkedIn</span>
                                    
                                    in
                                </a>
                            </div>
                            <p className="text-gray-400">
                                Email: league@iiitr.ac.in
                            </p>
                        </div> */}
                    </div>

                    <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                        <p className="text-gray-400">
                            © {new Date().getFullYear()} League of IIITR. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LeaderboardLanding;