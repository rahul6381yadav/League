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
        onSave(updatedProfile);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        name="name"
                        value={updatedProfile.name || ""}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="border p-2 rounded"
                    />
                    <input 
                        type="text"
                        name="photo"
                        value={updatedProfile.photo || ""}
                        onChange={handleInputChange}
                        placeholder="Your photo link"
                        className="border p-2 rounded"
                    />
                </div>
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
