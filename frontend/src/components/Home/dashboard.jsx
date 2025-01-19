import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

const Dashboard = () => {
  const scheduleTasks = [
    { time: "08:00", task: "Online Interview with UI Candidate", color: "bg-green-200" },
    { time: "09:00", task: "Replying email to applicants", color: "bg-blue-200" },
    { time: "10:00", task: "Weekly meeting", color: "bg-orange-200" },
    { time: "11:00", task: "Psychology test", color: "bg-purple-200" },
  ];

  const employees = [
    { name: "3D design", department: "DEV-X ", job: "3D design" },
    { name: "web HACKATHON", department: "CODESOC", job: "WEB DEV" },
    { name: "3D dance", department: "3D club", job: "CULTURAL" },
  ];

  const pastParticipation = [
    { event: "Hackathon", date: "2024-11-15", points: 30 },
    { event: "Cultural Fest", date: "2024-12-05", points: 40 },
    { event: "Tech Conference", date: "2025-01-10", points: 50 },
  ];

  const totalPoints = 120;

  // Map participation points to heatmap count, ensuring the format is correct for the calendar
  const heatmapData = pastParticipation.map((participation) => ({
    date: participation.date,
    count: participation.points, // Using points as the count value
  }));

  const getColorForPoints = (points) => {
    if (points >= 50) return "fill-green-200"; // Low points
    if (points <= 50) return "fill-green-400"; // Medium points
    return "fill-green-600"; // High points
  };

  const currentYear = new Date().getFullYear(); // Add this line to define currentYear

  return (
    <div className="min-h-screen p-8">
      <div className="flex gap-6 justify-between">
        {/* Student of the Year Section */}
        <div className="p-4 w-1/6 rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h2 className="text-lg font-bold mb-2 text-center">Student of the Year</h2>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden border-4">
              <img src="https://via.placeholder.com/150" alt="Student Photo" className="w-full h-full object-cover" />
            </div>
            <div className="text-center text-sm">
              <p>Name: <span className="font-semibold">John Doe</span></p>
              <p>Roll No: <span className="font-semibold">123456</span></p>
              <p>Point: <span className="font-semibold">456</span></p>
            </div>
          </div>
        </div>

        {/* Student of the Month Section */}
        <div className="p-4 w-1/6 rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h2 className="text-lg font-bold mb-2 text-center">Student of the Month</h2>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden border-4">
              <img src="https://via.placeholder.com/150" alt="Student Photo" className="w-full h-full object-cover" />
            </div>
            <div className="text-center text-sm">
              <p>Name: <span className="font-semibold">Jane Smith</span></p>
              <p>Roll No: <span className="font-semibold">654321</span></p>
              <p>Point: <span className="font-semibold">123</span></p>
            </div>
          </div>
        </div>

        {/* Today's Schedule Section */}
        <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-center">Today's Schedule</h2>
          <div className="flex overflow-x-auto space-x-4">
            {scheduleTasks.map((task, index) => (
              <div
                key={index}
                className={`flex-shrink-0 p-4 rounded-lg shadow ${task.color} dark:bg-gray-600`}
                style={{ minWidth: "200px" }}
              >
                <p className="text-sm font-medium mb-2">{task.time}</p>
                <p className="text-base font-semibold">{task.task}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events and Total Points Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Upcoming Events */}
        <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2">EVENTS</th>
                <th className="px-4 py-2">Organisers</th>
                <th className="px-4 py-2">Theme</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{employee.name}</td>
                  <td className="px-4 py-2">{employee.department}</td>
                  <td className="px-4 py-2">{employee.job}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Points */}
        <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-center">Total Points</h2>
          <div className="flex items-center justify-center h-full">
            <p className="text-4xl font-bold">{totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Participation Calendar Section */}
      <div className="mt-6 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Participation Calendar</h3>
        <div className="flex justify-center">
          <CalendarHeatmap
            startDate={new Date(`${currentYear}-01-01`)}  // Automatically use the first day of the current year
            endDate={new Date(`${currentYear}-12-31`)}    // Automatically use the last day of the current year
            values={heatmapData}
            classForValue={(value) => {
              return value ? getColorForPoints(value.count) : "fill-gray-200 dark:fill-gray-700";
            }}
            gutterSize={4} // Gap between day squares
            showMonthLabels={true} // Display month labels
            monthLabels={[
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ]}
            weekdayLabels={["M", "T", "W", "T", "F", "S"]}
            cellSize={20}
            style={{ pointerEvents: "none" }} // Disables hover events
          />
        </div>
      </div>

      {/* Past Participation Section */}
      <div className="mt-6 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4">Past Participation</h2>
        <table className="table-auto w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2">Event</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Points Credited</th>
            </tr>
          </thead>
          <tbody>
            {pastParticipation.map((participation, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{participation.event}</td>
                <td className="px-4 py-2">{participation.date}</td>
                <td className="px-4 py-2">{participation.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
