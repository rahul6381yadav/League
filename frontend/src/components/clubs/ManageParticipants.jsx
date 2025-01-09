import React from "react";
import Winners from "./Winners";
import ParticipationCard from "./Participants";

const ManageParticipants = () => {
  return (
    <>
      <div className="p-6 max-w-4xl space-y-5 rounded-lg bg-gray-100">
        <Winners />
        <ParticipationCard />
      </div>
    </>
  );
};

export default ManageParticipants;
