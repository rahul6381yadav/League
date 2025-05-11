import React, { useState } from "react";

const EditProfile = ({ profile, onSave, onClose }) => {
    const [updatedProfile, setUpdatedProfile] = useState({ ...profile });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        // Add phone number validation
        if (updatedProfile.phone && !/^\d{10}$/.test(updatedProfile.phone)) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }

        onSave(updatedProfile);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <p className="text-indigo-100 text-sm mt-1">Update your personal information</p>
                </div>

                {/* Form Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={updatedProfile.name || ""}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                         bg-white dark:bg-gray-700
                                         text-gray-900 dark:text-gray-100
                                         placeholder-gray-400 dark:placeholder-gray-500
                                         focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-violet-500 focus:border-transparent
                                         transition-colors"
                            />
                        </div>

                        {/* Social Media Section */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                            <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-3">Social Media Profiles</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        LinkedIn
                                    </label>
                                    <input
                                        type="text"
                                        name="linkedin"
                                        value={updatedProfile.linkedin || ""}
                                        onChange={handleInputChange}
                                        placeholder="Username"
                                        className="w-full px-3 py-2 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-gray-600
                                                 bg-white dark:bg-gray-700 text-sm
                                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        GitHub
                                    </label>
                                    <input
                                        type="text"
                                        name="github"
                                        value={updatedProfile.github || ""}
                                        onChange={handleInputChange}
                                        placeholder="Username"
                                        className="w-full px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600
                                                 bg-white dark:bg-gray-700 text-sm
                                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        LeetCode
                                    </label>
                                    <input
                                        type="text"
                                        name="Leetcode"
                                        value={updatedProfile.Leetcode || ""}
                                        onChange={handleInputChange}
                                        placeholder="Username"
                                        className="w-full px-3 py-2 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-gray-600
                                                 bg-white dark:bg-gray-700 text-sm
                                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Instagram
                                    </label>
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={updatedProfile.instagram || ""}
                                        onChange={handleInputChange}
                                        placeholder="Username"
                                        className="w-full px-3 py-2 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-gray-600
                                                 bg-white dark:bg-gray-700 text-sm
                                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg">
                            <h3 className="text-sm font-medium text-violet-700 dark:text-violet-300 mb-3">Contact Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={updatedProfile.phone || ""}
                                        onChange={handleInputChange}
                                        placeholder="10 digit number"
                                        className="w-full px-3 py-2 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-gray-600
                                                 bg-white dark:bg-gray-700 text-sm
                                                 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* LeeTrack Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                LeeTrack Password
                            </label>
                            <input
                                type="password"
                                name="LeeTrack"
                                value={updatedProfile.LeeTrack || ""}
                                onChange={handleInputChange}
                                placeholder="Enter LeeTrack Password"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                         bg-white dark:bg-gray-700
                                         text-gray-900 dark:text-gray-100
                                         focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-violet-500 focus:border-transparent
                                         transition-colors"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Used for automatic submission tracking</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg
                                 bg-gray-200 dark:bg-gray-700
                                 text-gray-700 dark:text-gray-300
                                 hover:bg-gray-300 dark:hover:bg-gray-600
                                 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg
                                 bg-gradient-to-r from-indigo-600 to-violet-600
                                 text-white
                                 hover:from-indigo-700 hover:to-violet-700
                                 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800
                                 transition-colors text-sm font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;