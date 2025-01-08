import React, { useEffect, useState } from "react";
import "./Clubs.css";
import { useNavigate } from 'react-router-dom';

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingMin, setRatingMin] = useState(0);
  const [ratingMax, setRatingMax] = useState(5);
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  const handleClubsDetails = async () => {

    const validatedMin = Math.max(0, Math.min(ratingMin, 5));
    const validatedMax = Math.max(validatedMin, Math.min(ratingMax, 5));

    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        ratingMin: validatedMin,
        ratingMax: validatedMax,
      }).toString();

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/club?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      setClubs(result.clubs);
    } catch (err) {
      console.error("Error fetching clubs:", err);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleMinRatingChange = (e) => {
    let value = Number(e.target.value);
    value = Math.max(0, Math.min(value, ratingMax, 5));
    setRatingMin(value);
  };

  const handleMaxRatingChange = (e) => {
    let value = Number(e.target.value);
    value = Math.max(ratingMin, Math.min(value, 5));
    setRatingMax(value);
  };

  useEffect(() => {
    handleClubsDetails();
  }, [searchQuery, ratingMin, ratingMax]);

  if (clubs && clubs.length === 0) {
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
        <div className="filters">
          <input
            type="number"
            min="0"
            max="5"
            placeholder="Min Rating "
            onChange={handleMinRatingChange}
            className="filter-input"
          />
          <input
            type="number"
            min="0"
            max="5"
            placeholder="Max Rating "
            onChange={handleMaxRatingChange}
            className="filter-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs ? clubs.map((club) => (
          <div key={club._id} className="card" onClick={() => navigate('/ClubPages', { state: { clubId: club._id, clubEmail: club.email, clubName: club.name } })}>
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
        )) : <p>no club available</p>}
      </div>
    </div>
  );
}

export default Clubs;
