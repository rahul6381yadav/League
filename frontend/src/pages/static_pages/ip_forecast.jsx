import React, { useState, useEffect } from 'react';
import { Wifi, Clock, Calendar, MapPin, Shield, Activity, ArrowRight, Navigation, Target } from 'lucide-react';

const IPForecastPage = () => {
    const [currentId, setCurrentId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showInstruction, setShowInstruction] = useState(false);

    const ipMapping = {
        69: "192.168.1.100",
        7: "10.0.0.45",
        444: "172.16.0.22",
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Simulate getting ID from URL params - you can replace this with actual URL param logic
        const simulatedId = 69; // Default for demo
        setCurrentId(simulatedId);

        // Show instruction after IP loads
        const timeout = setTimeout(() => {
            setShowInstruction(true);
        }, 1500);
        return () => clearTimeout(timeout);
    }, []);

    const getCurrentIP = () => {
        if (!currentId) return "Loading...";
        return ipMapping[currentId] || "NA";
    };

    const getStatusColor = () => {
        const colors = ["bg-green-400", "bg-blue-400", "bg-purple-400", "bg-pink-400"];
        return colors[currentId % colors.length] || "bg-green-400";
    };

    const getGlowColor = () => {
        const colors = ["shadow-green-400/50", "shadow-blue-400/50", "shadow-purple-400/50", "shadow-pink-400/50"];
        return colors[currentId % colors.length] || "shadow-green-400/50";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 text-white overflow-hidden">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20"></div>
                <div className="grid grid-cols-8 gap-6 p-8 h-full">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1 h-1 bg-white/30 rounded-full animate-pulse"
                            style={{
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: `${2 + (i % 3)}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 rounded-full animate-bounce"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + (i % 4)}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Header */}
            <div className="relative z-10 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <img
                                    src="https://students.iiitr.ac.in/assets/images/club/EHaCS_Logo.jpg"  // replace with your logo path
                                    alt="EHaCS Logo"
                                    className="rounded-xl object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    EHaCS Club
                                </h1>
                                <p className="text-gray-300 text-sm tracking-wide">Ethical Hacking & Cybersecurity Club</p>
                            </div>
                        </div>

                        <div className="text-right bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                            <div className="text-sm text-gray-300">
                                {currentTime.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </div>
                            <div className="text-xl font-mono font-bold text-cyan-400">
                                {currentTime.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Main IP Display */}
                    <div className={`bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 p-8 mb-8 shadow-2xl ${getGlowColor()} transform transition-all duration-1000 ${currentId ? 'scale-100' : 'scale-95'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className={`w-4 h-4 ${getStatusColor()} rounded-full animate-pulse shadow-lg`}></div>
                                    <span className="text-gray-300 text-sm font-medium tracking-wide">You decoded the String !</span>
                                    <Shield className="w-4 h-4 text-green-400" />
                                </div>
                                <div className="text-5xl font-mono font-bold mb-3 tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    {getCurrentIP()}
                                </div>
                                <div className="text-gray-400 text-base font-medium">Server IP Address</div>
                            </div>
                            <div className="text-right">
                                <div className={`w-24 h-24 ${getStatusColor()} rounded-full flex items-center justify-center opacity-20 shadow-xl animate-pulse`}>
                                    <Activity className="w-12 h-12" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Instruction Card */}
                    <div className={`transform transition-all duration-1000 ${showInstruction ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} mb-8`}>
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl border border-green-400/30 p-6 shadow-2xl shadow-green-400/20">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-green-400">Next Instruction</h3>
                                    <p className="text-green-300/80 text-sm">Step 1 of Treasure Hunt</p>
                                </div>
                                <div className="flex-1 flex justify-end">
                                    <ArrowRight className="w-6 h-6 text-green-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 border border-green-400/20">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Navigation className="w-5 h-5 text-emerald-400" />
                                    <span className="text-lg font-semibold text-white">Go to Lab 4</span>
                                </div>
                                <p className="text-gray-300 text-base">
                                    Navigate to <span className="font-mono font-bold text-green-400">Lab 4</span> using the IP address displayed above.
                                    Your next clue awaits there!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Event Info Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-cyan-400/30 transition-all duration-300 shadow-xl">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-cyan-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-200">Event Date</span>
                            </div>
                            <div className="text-2xl font-bold text-white">Sept 14, 2025</div>
                            <div className="text-cyan-400 text-sm font-medium">Sunday</div>
                        </div>

                        <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-purple-400/30 transition-all duration-300 shadow-xl">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-200">Start Time</span>
                            </div>
                            <div className="text-2xl font-bold text-white">5:30 PM</div>
                            <div className="text-purple-400 text-sm font-medium">IST</div>
                        </div>

                        <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-pink-400/30 transition-all duration-300 shadow-xl">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-pink-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-200">Status</span>
                            </div>
                            <div className="text-2xl font-bold text-white">Active</div>
                            <div className="text-pink-400 text-sm font-medium">Ready to Hunt</div>
                        </div>
                    </div>

                    {/* Enhanced Event Description */}
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                Tech Treasure Hunt
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-200 text-base leading-relaxed">
                                An interactive event blending puzzles, coding, cryptography, and exploration.
                                Solve challenges through QR codes, encrypted strings, buggy programs, riddles,
                                and binary puzzles.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['Puzzles', 'Coding', 'Cryptography', 'QR Codes', 'Binary', 'Teamwork'].map((tag) => (
                                    <span key={tag} className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-sm text-purple-300 border border-purple-400/30">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IPForecastPage;