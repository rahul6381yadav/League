import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const { id } = useParams();  
  const [event, setEvent] = useState({});
  const [allParticipants, setAllParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `http://localhost:4000/api/v1/club/events?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEvent(response.data.event);
      console.log(event);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
};


const fetchParticipants = async (id) => {
    try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
            `http://localhost:4000/api/v1/club/attendance?eventId=${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log(response.data)
        const data = response.data.records.map((record) => {
          return {
            id: record._id,
            roll_no: record.studentId.studentId?? "",
            name: record.studentId.fullName,
            batch: record.studentId.batchCode?? "",
            status:   record.status,
            points: record.pointsGiven
          }
        });
        console.log(data);
        setAllParticipants(data);
        console.log(allParticipants);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
useEffect(() => {
    if (id) fetchEvent(id);
    if (id) fetchParticipants(id);
  }, []);

return (
    <EventContext.Provider value={{ event, allParticipants, loading, error, fetchEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  return useContext(EventContext);
};
