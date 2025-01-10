// import React, { useState } from 'react';
// import { FaSearch } from 'react-icons/fa';

// const EventFilters = ({ setFilters }) => {
//   const [search, setSearch] = useState('');

//   const applyFilters = () => {
//     setFilters({ search });
//   };

//   return (
//     <div className="flex space-x-4 mb-4">
//       <input
//         type="text"
//         placeholder="Search events..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="p-2 border rounded w-full"
//       />
//       <button
//         onClick={applyFilters}
//         className="p-2 bg-blue-500 text-white rounded flex items-center space-x-2"
//       >
//         <FaSearch />
//         <span>Apply</span>
//       </button>
//     </div>
//   );
// };

// export default EventFilters;

import React, { useState } from 'react';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';

const EventFilters = ({ setFilters }) => {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const applyFilters = () => {
    setFilters({ search, date });
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4 bg-white p-4 rounded-lg shadow-md">
      <div className="flex-grow">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex-grow">
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <button
        onClick={applyFilters}
        className="p-2 bg-blue-500 text-white rounded flex items-center space-x-2 shadow-md hover:bg-blue-600 transition"
      >
        <FaSearch />
        <span>Apply</span>
      </button>
    </div>
  );
};

export default EventFilters;

