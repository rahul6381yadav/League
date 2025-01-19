import React, {useState} from 'react';

function Createclub() {
    const [Error, setError] = useState("");
    const [Success, setSuccess] = useState("");
    const token = localStorage.getItem("jwtToken");
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        email: '',
        image: '',
        members: [],
        overallRating: 0,
        studentMembers: [],
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:4000/api/v1/club`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess("Club created successfully");
                console.log('Club created successfully:', data);
                // Handle success (e.g., show a success message or redirect)
                setFormData({
                    name: '',
                    description: '',
                    email: '',
                    image: '',
                    members: '',
                    overallRating: 0,
                    studentMembers: '',
                });
            } else {
                setError(data.message);
                console.log('Error creating club:', data.message);
                // Handle error (e.g., show error message)
            }
        } catch (error) {
            setError(error);
            console.error('Error:', error);
            // Handle network or other errors
        }

        console.log(formData);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">Create New Club</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <p className="text-sm text-green-600 text-center">
                        {Success}
                    </p>
                    <p className="text-sm text-red-600 text-center">
                        {Error}
                    </p>
                    <label htmlFor="name" className="block text-gray-700 font-medium">Club Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 font-medium">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium">Club Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="image" className="block text-gray-700 font-medium">Image URL</label>
                    <input
                        type="url"
                        name="image"
                        id="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="overallRating" className="block text-gray-700 font-medium">Overall Rating</label>
                    <input
                        type="number"
                        name="overallRating"
                        id="overallRating"
                        value={formData.overallRating}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="members" className="block text-gray-700 font-medium">Members</label>
                    <input
                        type="text"
                        name="members"
                        id="members"
                        value={formData.members}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter member emails separated by commas"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="studentMembers" className="block text-gray-700 font-medium">Student Members</label>
                    <input
                        type="text"
                        name="studentMembers"
                        id="studentMembers"
                        value={formData.studentMembers}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter student member emails separated by commas"
                    />
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition duration-200"
                    >
                        Create Club
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Createclub;