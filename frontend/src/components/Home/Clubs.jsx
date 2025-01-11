import React, { useEffect, useState } from "react";
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

      const response = await fetch(`http://localhost:4000/api/v1/club?${queryParams}`, {
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
      <div className="text-center mb-8">
        <div className="relative inline-block w-1/2">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none"></i>
          <input
            type="text"
            placeholder="Search for a club..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 py-3 border border-gray-300 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mt-4">
          <input
            type="number"
            min="0"
            max="5"
            placeholder="Min Rating"
            onChange={handleMinRatingChange}
            className="w-40 py-2 px-3 border border-gray-300 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="number"
            min="0"
            max="5"
            placeholder="Max Rating"
            onChange={handleMaxRatingChange}
            className="w-40 py-2 px-3 border border-gray-300 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs ? (
          clubs.map((club) => (
            <div
              key={club._id}
              className="relative flex flex-col justify-center items-center text-center bg-[#191c29] dark:bg-gray-800 w-[calc(65vh/1.5)] h-[65vh] p-[3px] rounded-lg cursor-pointer transition-all group"
              onClick={() =>
                navigate('/ClubPages', {
                  state: { clubId: club._id, clubEmail: club.email, clubName: club.name },
                })
              }
            >
              {/* Animated Gradient Border */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#5ddcff] via-[#3c67e3] to-[#4e00c2] p-[4px] opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                <div className="w-full h-full bg-[#191c29] dark:bg-gray-800 rounded-lg"></div>
              </div>

              {/* Inner Glow Effect */}
              {/* <div className="absolute inset-0 rounded-lg scale-105 bg-gradient-to-r from-[#5ddcff] via-[#3c67e3] to-[#4e00c2] blur-[calc(65vh/6)] opacity-75 group-hover:opacity-0 transition-opacity duration-200"></div> */}

              {/* Card Shadow */}
              <div className="absolute inset-0 rounded-lg shadow-[0px_0px_15px_rgba(93,220,255,0.5)] group-hover:shadow-[0px_0px_30px_10px_rgba(93,220,255,0.8)]"></div>

              {/* Card Content */}
              <div className="relative flex flex-col justify-center items-center w-full h-full text-transparent group-hover:text-[#58c7fa] dark:group-hover:text-[#7bdfff] transition-all duration-500 font-cursive">
                <div className="card-image">
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-2">{club.name}</h2>
                  <p className="text-gray-300 dark:text-gray-400 mb-3 text-sm">{club.description}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    <strong>Rating:</strong> {club.overallRating}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    <i className="fa fa-envelope mr-1"></i>
                    <a href={`mailto:${club.email}`}>{club.email}</a>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No club available</p>
        )}
      </div>


    </div>
  );
}

export default Clubs;
