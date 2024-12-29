import React, { useEffect, useState } from "react";
import "./Clubs.css";

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("authToken");

  const handleClubsDetails = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/v1/club", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      setClubs(result.clubs);
      setFilteredClubs(result.clubs); 
    } catch (err) {
      console.error("Error fetching clubs:", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredClubs(
      clubs.filter((club) =>
        club.name.toLowerCase().includes(query) ||
      club.description.toLowerCase().includes(query) 
      )
    );
  };

  useEffect(() => {
    handleClubsDetails();
  }, []); 

  if (clubs.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Loading clubs...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
     <div className="search-bar">
  <div className="search-input-container">
    <i className="fas fa-search search-icon"></i>
    <input
      type="text"
      placeholder="Search for a club..."
      value={searchQuery}
      onChange={handleSearch}
      className="search-input"
    />
  </div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClubs.map((club) => (
          <div key={club._id} className="card">
            <div className="card-image">
              <img
                src={club.image}
                alt={club.name}
                className="w-full h-40 object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-bold mb-2">{club.name}</h2>
              <p className="text-gray-300 mb-3 text-sm">{club.description}</p>
              <p className="text-gray-400 text-sm">
                <strong>Rating:</strong> {club.overallRating}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                <i className="fa fa-envelope mr-1"></i>
                <a href={`mailto:${club.email}`}>{club.email}</a>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Clubs;
