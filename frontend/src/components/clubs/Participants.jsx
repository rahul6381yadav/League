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

const ParticipantsTable = () => {
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
  const [isEdit, setIsEdit] = useState(false);

  return (
    <div className="w-full overflow-x-auto">
      <table className="bg-white dark:bg-gray-800 shadow-md rounded-lg border-collapse min-w-full">
        <thead>
          <tr className="border-b hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
            <th className="px-5 py-4 text-left text-[14px] sticky inset-y-0 start-0 bg-white dark:bg-gray-800">
              <input
                type="checkbox"
                className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 
             dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-600 
             dark:ring-offset-gray-800"
              />
            </th>
            <th className="px-4 py-4 text-left text-[14px] dark:text-white">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
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
          </tr>
        </thead>
        <tbody>
          {participants.map((participant, index) => (
            <tr
              key={participant.roll_no}
              className="border-b last:border-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-[14px] dark:text-white"
            >
              <td className="sticky inset-y-0 start-0 bg-white px-4 py-2 dark:bg-gray-800">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 
             dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-600 
             dark:ring-offset-gray-800"
                />
              </td>
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
              <td className="px-5 py-4 text-gray-700 dark:text-gray-400">
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
              <td className="px-5 py-4 text-gray-700 dark:text-gray-400">
                {participant.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ParticipationCard = () => {
  return (
    <div className="w-full px-3 mx-auto">
      <div className="bg-white dark:bg-gray-800 flex flex-col rounded-lg items-center justify-center p-4 w-full">
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

          <button className="flex items-center bg-gray-500 text-xs text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600">
            <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit
          </button>
        </div>
        <ParticipantsTable />
      </div>
      <Pagination currentPage={2} totalPages={5} />
    </div>
  );
};

export default ParticipationCard;
