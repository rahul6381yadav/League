import React from "react";
import Winners from "./Winners";
import ParticipationCard from "./Participants";
import EventHeader from "./EventHeader";
import { useParams } from "react-router-dom";

const ManageParticipants = () => {
  const {id} = useParams();

  return (
    <>
    <EventHeader id ={id}/>
      <div className=" flex flex-col p-6 w-full space-y-5 items-center bg-gray-200 dark:bg-gray-900">
        <Winners />
        <ParticipationCard id={id}/>
      </div>
    </>
  );
};

export default ManageParticipants;
