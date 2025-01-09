import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

  const [isEditOn, setIsEditOn] = useState(false);
  const [ids, setIds] = useState([]);
  

  return (
    // <div className="p-6 bg-gray-50">
    <div className="overflow-x-auto">
      <table className="bg-white shadow-md rounded-lg border-collapse overflow-hidden min-w-full">
        <thead>
          <tr className="border-b hover:bg-gray-100 transition-colors">
            <th className="px-5 py-4 text-left text-[14px] sticky inset-y-0 start-0 bg-white dark:bg-gray-900">
              <label htmlFor="SelectAll" className="sr-only">
                Select All
              </label>

              <input
                type="checkbox"
                id="SelectAll"
                className="size-5 rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-offset-gray-900"
              />
            </th>
            {/* <th className="px-5 py-4 text-left text-[14px]">#</th> */}
            <th className="px-4 py-4 text-left text-[14px]">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Student
            </th>
            <th className="px-4 py-4 text-left text-[14px]">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Batch
            </th>
            <th className="px-4 py-4 text-left text-[14px]">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Status
            </th>
            <th className="px-4 py-4 text-left text-[14px]">
              <div>
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                Points
              </div>
              <div>(Max: 100)</div>
            </th>
            {/* <th className="px-4 py-4 text-left text-[14px]">
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Actions
              </th> */}
          </tr>
        </thead>
        <tbody>
          {participants.map((participant, index) => (
            <tr
              key={participant.roll_no}
              className="border-b last:border-none hover:bg-gray-100 transition-colors text-[14px]"
            >
              {/* <td className="px-5 py-4 text-gray-700">{index + 1}</td> */}
              <td className="sticky inset-y-0 start-0 bg-white px-4 py-2 dark:bg-gray-900">
                <label className="sr-only" htmlFor={index}>
                  Row 1
                </label>

                <input
                  className="size-5 rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-offset-gray-900"
                  type="checkbox"
                  id={index}
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
                  <div className="font-semibold text-gray-900">
                    {participant.name}
                  </div>
                  <div className="text-[14px] text-gray-500">
                    {participant.roll_no}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-gray-700">{participant.batch}</td>
              <td className="px-5 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-[14px] ${
                    participant.status === "Present"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {participant.status}
                </span>
              </td>
              <td className="px-5 py-4 text-gray-700">{participant.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    // </div>
  );
};

const Pagination = () => {
  return (
    <>
      <ol className="flex mt-3 justify-center gap-1 text-xs font-medium">
        <li>
          <a
            href="#"
            className="inline-flex size-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-900 rtl:rotate-180"
          >
            <span className="sr-only">Prev Page</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </li>

        <li>
          <a
            href="#"
            className="block size-8 rounded border border-gray-200 bg-white text-center leading-8 text-gray-900"
          >
            1
          </a>
        </li>

        <li className="block size-8 rounded border-blue-600 bg-blue-600 text-center leading-8 text-white">
          2
        </li>

        <li>
          <a
            href="#"
            className="block size-8 rounded border border-gray-200 bg-white text-center leading-8 text-gray-900"
          >
            3
          </a>
        </li>

        <li>
          <a
            href="#"
            className="block size-8 rounded border border-gray-200 bg-white text-center leading-8 text-gray-900"
          >
            4
          </a>
        </li>

        <li>
          <a
            href="#"
            className="inline-flex size-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-900 rtl:rotate-180"
          >
            <span className="sr-only">Next Page</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </li>
      </ol>
    </>
  );
};

const ParticipationCard = () => {
    return (
      <>
        <div className="max-w-4xl">
          <div className="bg-white flex flex-col rounded-lg items-center justify-center p-4 w-full md:w-1/2">
            {/* Title and Edit Button */}
            <div className="flex flex-row sm:flex-row mb-2 w-full md:px-20">
              <div className="flex font-semibold text-lg ml-4">
                Participants
              </div>
              <button className="ml-auto flex items-center bg-gray-500 text-xs text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none mt-2 sm:mt-0">
                <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit
              </button>
            </div>
  
            {/* Participants Table */}
            <ParticipantsTable />
            <Pagination />
          </div>
        </div>
      </>
    );
  };
  

export default ParticipationCard;
