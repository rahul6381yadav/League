import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const Dashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId, isAuthenticated } = useAuth();
  const token = localStorage.getItem("authToken");

  const pastParticipation = [
    { event: "Hackathon", date: "2024-11-15", points: 30 },
    { event: "Cultural Fest", date: "2024-12-05", points: 40 },
    { event: "Tech Conference", date: "2025-01-10", points: 50 },
  ];

  const totalPoints = 120;

  const heatmapData = pastParticipation.map((participation) => ({
    date: participation.date,
    count: participation.points,
  }));

  const getColorForPoints = (points) => {
    if (points >= 50) return "bg-[#9649ff]";
    if (points <= 50) return "bg-[#d0aeff]";
    return "bg-[#4d148f]";
  };

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/club/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(response.data.events);
        setLoading(false);
      } catch (err) {
        setError("Failed to load events");
        setLoading(false);
      }
    };

    const fetchTodaySchedule = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/club/events`, {
          params: { date: new Date().toISOString() },
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodaySchedule(response.data.events);
        setLoading(false);
      } catch (err) {
        setError("Failed to load today's schedule");
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
    fetchTodaySchedule();
  }, [token]);

  return (
      <div className="min-h-screen p-8 bg-[#f9f4ff] dark:bg-[#38007a]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="p-6 rounded-lg shadow-md bg-[#e4d2ff] dark:bg-[#4d148f]">
            <h2 className="text-lg font-semibold mb-4 text-center text-[#4d148f] dark:text-[#f9f4ff]">
              Today's Schedule
            </h2>
            <div className="flex overflow-x-auto space-x-4">
              {loading ? (
                  <p>Loading today's schedule...</p>
              ) : error ? (
                  <p className="text-[#b37bff]">{error}</p>
              ) : (
                  todaySchedule.map((task, index) => (
                      <div
                          key={index}
                          className={`flex-shrink-0 p-4 rounded-lg shadow bg-[#f0e6ff] dark:bg-[#5c17b2] text-[#4d148f] dark:text-[#e4d2ff]`}
                          style={{ minWidth: "200px" }}
                      >
                        <p className="text-sm font-medium mb-2 text-[#6b15db] dark:text-[#d0aeff]">
                          {task.localStartTime} - {task.localEndTime}
                        </p>
                        <p className="text-m font-medium mb-3 text-[#4d148f] dark:text-[#e4d2ff]">
                          {task.eventName}
                        </p>
                      </div>
                  ))
              )}
            </div>
          </div>

          {/* Participation Calendar */}
          <div className="mt-6 p-6 rounded-lg shadow-md bg-[#e4d2ff] dark:bg-[#6b15db]">
            <h3 className="text-lg font-semibold mb-4 text-[#4d148f] dark:text-[#f9f4ff]">
              Participation Calendar
            </h3>
            <div className="flex justify-center">
              <CalendarHeatmap
                  startDate={new Date(`${currentYear}-01-01`)}
                  endDate={new Date(`${currentYear}-12-31`)}
                  values={heatmapData}
                  classForValue={(value) =>
                      value ? getColorForPoints(value.count) : "bg-[#f0e6ff] dark:bg-[#5c17b2]"
                  }
                  gutterSize={4}
                  showMonthLabels={true}
                  monthLabels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
                  weekdayLabels={["M", "T", "W", "T", "F", "S"]}
                  cellSize={20}
                  style={{ pointerEvents: "none" }}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
