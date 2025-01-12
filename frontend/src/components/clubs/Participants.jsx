import React, { useState } from "react";
import Pagination from "./Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  faUser,
  faUsers,
  faCheckCircle,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

const RangeInput = ({ initialCurrent, min, max }) => {
  const [current, setCurrent] = useState(initialCurrent);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleChange = (event) => {
    setCurrent(event.target.value);
  };

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  // Calculate the position of the tooltip based on the current value
  const tooltipPosition = ((current - min) / (max - min)) * 100;

  return (
    <div className="relative mb-6 w-64"> {/* Set a specific width here */}
      <label htmlFor="labels-range-input" className="sr-only">
        Labels range
      </label>
      <input
        id="labels-range-input"
        type="range"
        value={current}
        min={min}
        max={max}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        onChange={handleChange}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {tooltipVisible && (
        <div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1"
          style={{ left: `${tooltipPosition}%` }}
        >
          ${current}
        </div>
      )}
      <span className="text-sm text-gray-500 dark:text-gray-400 absolute left-0 -bottom-6">
        Min (${min})
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400 absolute left-1/3 -translate-x-1/2 -bottom-6">
        ${Math.floor((min + max) / 2.5)}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400 absolute left-2/3 -translate-x-1/2 -bottom-6">
        ${Math.floor((min + max) / 1.5)}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400 absolute right-0 -bottom-6">
        Max (${max})
      </span>
    </div>
  );
};

const ParticipantsTable = ({isEdit}) => {
  const [participants, setParticipants] = useState([
    {
      name: "John Doe",
      roll_no: "21BCS001",
      batch: "Batch A",
      status: "Present",
      points: 85,
    },
    {
      name: "Jane Smith",
      roll_no: "21BCS002",
      batch: "Batch A",
      status: "Absent",
      points: 0,
    },
    {
      name: "Michael Johnson",
      roll_no: "21BCS003",
      batch: "Batch B",
      status: "Present",
      points: 90,
    },
    {
      name: "Emily Davis",
      roll_no: "21BCS004",
      batch: "Batch B",
      status: "Present",
      points: 78,
    },
    {
      name: "Chris Lee",
      roll_no: "21BCS005",
      batch: "Batch C",
      status: "Absent",
      points: 0,
    },
  ]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="bg-white dark:bg-gray-800 shadow-md rounded-lg border-collapse min-w-full">
        <thead>
          <tr className="border-b border hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
            <th className="px-4 py-4 text-left text-[14px] dark:text-white">
              <FontAwesomeIcon icon={faUser } className="mr-2" />
              Student
            </th>
            <th className="px-4 py-4 text-left text-[14px] dark:text-white">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Batch
            </th>
            <th className="px-4 py-4 text-left text-[14px] dark:text-white">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Status
            </th>
            <th className="px-4 py-4 text-left text-[14px] dark:text-white">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Points
            </th>
            <th className="px-4 py-4 text-left text-[14px] dark:text-white">
              {/* Empty header for ellipsis */}
            </th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => (
            <tr
              key={participant.roll_no}
              className="border-b last:border-none dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-[14px] dark:text-white"
            >
              <td className="flex items-center px-2 py-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src="https://via.placeholder.com/40"
                    alt={`${participant.name} profile`}
                  />
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {participant.name}
                  </div>
                  <div className="text-[14px] text-gray-500 dark:text-gray-400">
                    {participant.roll_no}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                {participant.batch}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-[14px] ${
                    participant.status === "Present"
                      ? "bg-green-100 text-green-600 dark:bg-green-700 dark:text-green-200"
                      : "bg-red-100 text-red-600 dark:bg-red-700 dark:text-red-200"
                  }`}
                >
                  {participant.status}
                </span>
              </td>
              <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                {!isEdit ? participant.points : <RangeInput current={participants} min={0} max={100} />}
              </td>
              <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                …
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ParticipationCard = () => {
  const [isEdit, setIsEdit] = useState(false);

  return (
    <div className="w-full px-3 mx-auto">
      <div className="bg-white dark:bg-gray-800 flex flex-col rounded-lg items-center justify-center py-4 px-8 w-full">
        <div className="flex flex-row w-full p-3">
          <h2 className="font-semibold text-lg ml-4 dark:text-white">
            Participants
          </h2>
          <div className="ml-auto mr-5 relative">
            <label htmlFor="participant" className="sr-only">
              Participants
            </label>

            <input
              type="text"
              id="participant"
              placeholder="Search Participants"
              className="w-full border h-10 rounded-md p-1 border-gray-200 pe-5 shadow-sm sm:text-sm px-1
               text-gray-700 bg-white placeholder-gray-400
               dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
            />

            <span
              className="pointer-events-none absolute inset-y-0 end-0 grid w-10 place-content-center text-gray-500 
                   dark:text-gray-400"
            >
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>

          <button onClick={() => setIsEdit(!isEdit)} className="flex items-center bg-gray-500 text-xs text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600">
            <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit
          </button>
        </div>
        <ParticipantsTable isEdit={isEdit}/>
      </div>
      <Pagination totalPages={5} />
    </div>
  );
};

export default ParticipationCard;
