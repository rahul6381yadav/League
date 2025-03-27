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

        // Construct valid URLs for social media links


        onSave(updatedProfile);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-mirage-950/50 dark:bg-mirage-950/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-mirage-100 dark:bg-mirage-800 rounded-lg shadow-lg w-96 transition-all">
                {/* Header */}
                <div className="p-6 border-b border-mirage-200 dark:border-mirage-700">
                    <h2 className="text-xl font-bold text-mirage-900 dark:text-mirage-50">Edit Profile</h2>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-mirage-700 dark:text-mirage-200">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={updatedProfile.name || ""}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-2 rounded-lg border border-mirage-300 dark:border-mirage-600
                                         bg-mirage-50 dark:bg-mirage-900
                                         text-mirage-900 dark:text-mirage-50
                                         placeholder-mirage-400 dark:placeholder-mirage-500
                                         focus:outline-none focus:ring-2 focus:ring-mirage-400 dark:focus:ring-mirage-500
                                         transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-mirage-700 dark:text-mirage-200">
                                Photo URL
                            </label>
                            <input
                                type="text"
                                name="photo"
                                value={updatedProfile.photo || ""}
                                onChange={handleInputChange}
                                placeholder="Enter photo URL"
                                className="w-full px-4 py-2 rounded-lg border border-mirage-300 dark:border-mirage-600
                                         bg-mirage-50 dark:bg-mirage-900
                                         text-mirage-900 dark:text-mirage-50
                                         placeholder-mirage-400 dark:placeholder-mirage-500
                                         focus:outline-none focus:ring-2 focus:ring-mirage-400 dark:focus:ring-mirage-500
                                         transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-mirage-700 dark:text-mirage-200">
                                Linkedin Username
                            </label>
                            <input
                                type="text"
                                name="linkedin"
                                value={updatedProfile.linkedin || ""}
                                onChange={handleInputChange}
                                placeholder="Enter Linkedin Username"
                                className="w-full px-4 py-2 rounded-lg border border-mirage-300 dark:border-mirage-600
                                         bg-mirage-50 dark:bg-mirage-900
                                         text-mirage-900 dark:text-mirage-50
                                         placeholder-mirage-400 dark:placeholder-mirage-500
                                         focus:outline-none focus:ring-2 focus:ring-mirage-400 dark:focus:ring-mirage-500
                                         transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-mirage-700 dark:text-mirage-200">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={updatedProfile.phone || ""}
                                onChange={handleInputChange}
                                placeholder="Enter Phone Number(10 digits) "
                                className="w-full px-4 py-2 rounded-lg border border-mirage-300 dark:border-mirage-600
                                         bg-mirage-50 dark:bg-mirage-900
                                         text-mirage-900 dark:text-mirage-50
                                         placeholder-mirage-400 dark:placeholder-mirage-500
                                         focus:outline-none focus:ring-2 focus:ring-mirage-400 dark:focus:ring-mirage-500
                                         transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-mirage-700 dark:text-mirage-200">
                                Leetcode Username
                            </label>
                            <input
                                type="text"
                                name="Leetcode"
                                value={updatedProfile.Leetcode || ""}
                                onChange={handleInputChange}
                                placeholder="Enter Leetcode Username "
                                className="w-full px-4 py-2 rounded-lg border border-mirage-300 dark:border-mirage-600
                                         bg-mirage-50 dark:bg-mirage-900
                                         text-mirage-900 dark:text-mirage-50
                                         placeholder-mirage-400 dark:placeholder-mirage-500
                                         focus:outline-none focus:ring-2 focus:ring-mirage-400 dark:focus:ring-mirage-500
                                         transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-mirage-700 dark:text-mirage-200">
                                Instagram Username
                            </label>
                            <input
                                type="text"
                                name="instagram"
                                value={updatedProfile.instagram || ""}
                                onChange={handleInputChange}
                                placeholder="Enter Instagram Username "
                                className="w-full px-4 py-2 rounded-lg border border-mirage-300 dark:border-mirage-600
                                         bg-mirage-50 dark:bg-mirage-900
                                         text-mirage-900 dark:text-mirage-50
                                         placeholder-mirage-400 dark:placeholder-mirage-500
                                         focus:outline-none focus:ring-2 focus:ring-mirage-400 dark:focus:ring-mirage-500
                                         transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-mirage-700 dark:text-mirage-200">
                                Github Username
                            </label>
                            <input
                                type="text"
                                name="github"
                                value={updatedProfile.github || ""}
                                onChange={handleInputChange}
                                placeholder="Enter Github Username "
                                className="w-full px-4 py-2 rounded-lg border border-mirage-300 dark:border-mirage-600
                                         bg-mirage-50 dark:bg-mirage-900
                                         text-mirage-900 dark:text-mirage-50
                                         placeholder-mirage-400 dark:placeholder-mirage-500
                                         focus:outline-none focus:ring-2 focus:ring-mirage-400 dark:focus:ring-mirage-500
                                         transition-colors"
                            />
                        </div>



                    </div>
                </div>

                {/* Footer with Actions */}
                <div className="p-6 border-t border-mirage-200 dark:border-mirage-700 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg
                                 bg-mirage-200 dark:bg-mirage-700
                                 text-mirage-900 dark:text-mirage-50
                                 hover:bg-mirage-300 dark:hover:bg-mirage-600
                                 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg
                                 bg-mirage-100 dark:bg-mirage-900
                                 text-mirage-900 dark:text-mirage-50
                                 hover:bg-mirage-200 dark:hover:bg-mirage-800
                                 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;