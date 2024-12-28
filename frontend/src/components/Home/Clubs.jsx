import React, { useState, useEffect } from "react";
import "./Clubs.css";

function Clubs() {
  const [clubs, setClubs] = useState([]); // State for club data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const token = localStorage.getItem("authToken"); // Retrieve token from local storage

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/v1/club", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Use template literals for token
          },
        });

        
        const data = await response.json();
        setClubs(data.clubs); // Update state with fetched data
      } catch (err) {
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // Ensure loading is false after fetch
      }
    };

    fetchClubs();
  }, [token]); // Add token as a dependency

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  console.log(clubs[0].logo)
  return (
    <div className="app">
      <h1 className="title">CLUBS</h1>
      <div className="clubs-container">
        {clubs.map((club) => (
          <div className="club-box">
            <img
              src={club.logo}
              alt={`${club.name} Logo`} // Use template literals for alt text
              className="club-logo"
            />
            <h2 className="club-name">{club.name}</h2>
            <p className="club-description">{club.description}</p>
            <button className="details-button">Details</button>
            <br />
            <br />
            {club.email && (
              <a href={`mailto:${club.email}`} className="mail-link"> {/* Use template literals for href */}
                <img
                  src="https://img.icons8.com/?size=100&id=86862&format=png&color=FFFFFF"
                  alt="Mail Logo"
                  className="mail-logo"
                />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Clubs;
