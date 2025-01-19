import React from "react";
import Winners from "./Winners";
import ParticipationCard from "./Participants";
import EventHeader from "./EventHeader";
import {EventProvider} from "../../context/EventContext";

const ManageParticipants = () => {
    return (
        <>
            <EventProvider>
                <EventHeader/>
                <div className=" flex flex-col p-6 w-full space-y-5 items-center bg-gray-200 dark:bg-gray-900">
                    <Winners/>
                    <ParticipationCard/>
                </div>
            </EventProvider>
        </>
    );
};

export default ManageParticipants;
