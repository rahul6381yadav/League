import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Trophy, Info, Upload, Mail, ChevronLeft, Check } from 'lucide-react';
import { backendUrl } from '../../../utils/routes';
import { jwtDecode } from "jwt-decode";
import { useParams } from 'react-router-dom';

// Ensure token exists before attempting to decode it
const token = localStorage.getItem("jwtToken");
let decodedToken = null;
if (token) {
  try {
    decodedToken = jwtDecode(token);
  } catch (error) {
    console.error("Error decoding JWT token:", error.message);
  }
}

function EditEventPage() {
  const [collateralClubs, setCollateralClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [selectedCollateralClubs, setSelectedCollateralClubs] = useState([]);
  const token = localStorage.getItem("jwtToken");
  const { id } = useParams();
  const [eventData, setEventData] = useState({
    eventName: '',
    clubIds: [],
    photo: '',
    description: '',
    venue: '',
    duration: '',
    maxPoints: '',
    endDate: '',
    date: '',
    numberOfWinners: '',
  });
  const [tab, setTab] = useState('details'); // 'details' or 'clubs'
  const [isLoading, setIsLoading] = useState(true);
  const { clubId: primaryClubId, clubName: primaryClubName } = decodedToken || {};

  const handleBack = () => {
    window.history.back();
  };  // Format dates for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format to YYYY-MM-DDTHH:MM format needed by datetime-local input
    return date.toISOString().slice(0, 16);
  };

  // Function to format date with proper timezone offset (+5:30 hours)
  const formatDateWithOffset = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Add 5 hours and 30 minutes to adjust for the timezone
    const offsetTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    return offsetTime.toISOString();
  };

  // Fetch event data and available clubs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch event data
        const eventResponse = await fetch(`${backendUrl}/api/v1/club/events?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const eventResult = await eventResponse.json();

        // Format dates for input fields
        const formattedEvent = {
          ...eventResult.event,
          date: formatDateForInput(eventResult.event.date),
          endDate: formatDateForInput(eventResult.event.endDate)
        };

        setEventData(formattedEvent);

        // Filter out the primary club from the clubIds
        const eventClubIds = eventResult.event.clubIds.map(club =>
          typeof club === 'object' ? club._id : club
        );

        // Fetch all available clubs
        const clubsResponse = await fetch(`${backendUrl}/api/v1/club`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const clubsData = await clubsResponse.json();
        const availableClubs = clubsData.clubs.filter(club => club._id !== primaryClubId);
        setAllClubs(availableClubs);

        // Set collateral clubs and selected clubs
        const collateralClubIds = eventClubIds.filter(id => id !== primaryClubId);
        setSelectedCollateralClubs(collateralClubIds);

        // Set the clubs from the event that are still available
        const eventClubs = eventResult.event.clubIds.filter(club =>
          typeof club === 'object' && club._id !== primaryClubId
        );
        setCollateralClubs(eventClubs);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, primaryClubId]);

  const handleInputChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (clubId) => {
    setSelectedCollateralClubs((prev) => {
      if (prev.includes(clubId)) {
        return prev.filter((id) => id !== clubId);
      }
      return [...prev, clubId];
    });
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Format the dates with proper timezone adjustment (+5:30 hours)
    const formattedData = {
      ...eventData,
      date: eventData.date ? formatDateWithOffset(eventData.date) : '',
      endDate: eventData.endDate ? formatDateWithOffset(eventData.endDate) : '',
    };

    const clubIds = [primaryClubId, ...selectedCollateralClubs];
    const updatedEvent = { ...formattedData, clubIds };

    try {
      const response = await fetch(`${backendUrl}/api/v1/club/events?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedEvent),
      });

      const data = await response.json();
      if (data.isError) {
        alert('Error updating event: ' + data.message);
      } else {
        alert('Event updated successfully!');
        window.history.back();
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">

            <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-2">Edit Event</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 rounded-full">
              {selectedCollateralClubs.length + 1} Club{selectedCollateralClubs.length ? 's' : ''}
            </span>
            <button
              onClick={() => handleFormSubmit(new Event('submit'))}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              Update Event
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium ${tab === 'details'
                    ? 'text-indigo-600 dark:text-indigo-300 border-b-2 border-indigo-500'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400'
                    }`}
                  onClick={() => setTab('details')}
                >
                  Event Details
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium ${tab === 'clubs'
                    ? 'text-indigo-600 dark:text-indigo-300 border-b-2 border-indigo-500'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400'
                    }`}
                  onClick={() => setTab('clubs')}
                >
                  Collaborating Clubs ({selectedCollateralClubs.length + 1})
                </button>
              </div>

              {/* Tab content */}
              {tab === 'details' ? (
                <form className="p-6 space-y-6" onSubmit={handleFormSubmit}>
                  {/* Banner preview */}
                  <div className="relative h-32 w-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white flex flex-col items-center">
                        <Upload size={24} />
                        <span className="text-sm mt-1">Update Banner</span>
                      </div>
                    </div>
                    {eventData.photo ? (
                      <img
                        src={eventData.photo}
                        alt="Event banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-sm">Banner Image</span>
                      </div>
                    )}
                  </div>                  {/* Banner URL input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">Event poster URL</label>
                    <input
                      type="text"
                      name="photo"
                      value={eventData.photo || ''}
                      onChange={handleInputChange}
                      placeholder="Enter image URL for event banner"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 dark:text-gray-200"
                    />
                  </div>

                  {/* Event Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">Event Name</label>
                    <input
                      type="text"
                      name="eventName"
                      value={eventData.eventName || ''}
                      onChange={handleInputChange}
                      placeholder="Enter event name"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 dark:text-gray-200"
                      required
                    />
                  </div>                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={eventData.description || ''}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Describe your event"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 dark:text-gray-200"
                      required
                    />
                  </div>
                  {/* Grid layout for event details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        name="date"
                        value={eventData.date || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 dark:text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={eventData.endDate || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 dark:text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={eventData.duration || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. 2 hours, 3 days"
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 dark:text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                        Venue
                      </label>
                      <input
                        type="text"
                        name="venue"
                        value={eventData.venue || ''}
                        onChange={handleInputChange}
                        placeholder="Event location"
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 dark:text-gray-200"
                        required
                      />
                    </div>                    <div>
                      <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                        Maximum Points
                      </label>
                      <input
                        type="number"
                        name="maxPoints"
                        value={eventData.maxPoints || ''}
                        onChange={handleInputChange}
                        placeholder="Maximum points"
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 dark:text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mirage-600 dark:text-mirage-200 mb-2">
                        Number of Winners
                      </label>
                      <input
                        type="number"
                        name="numberOfWinners"
                        value={eventData.numberOfWinners || ''}
                        onChange={handleInputChange}
                        placeholder="Number of winners"
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Clubs</h3>
                    <div className="flex items-center gap-2 mb-4 bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                      <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{primaryClubName}</h4>
                        <span className="text-xs bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Clubs</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">                      {allClubs.map((club) => (
                      <label
                        key={club._id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer border
                            ${selectedCollateralClubs.includes(club._id)
                            ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-400 dark:border-violet-700'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCollateralClubs.includes(club._id)}
                            onChange={() => handleCheckboxChange(club._id)}
                            className="accent-violet-600 w-5 h-5 rounded border-gray-300 dark:border-gray-600 focus:ring-violet-500"
                            onClick={e => e.stopPropagation()}
                          />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                              ${selectedCollateralClubs.includes(club._id)
                              ? 'bg-violet-500 dark:bg-violet-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                            <Mail className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{club.name}</h4>
                          </div>
                        </div>
                        <div>
                          {selectedCollateralClubs.includes(club._id) && (
                            <Check size={18} className="text-violet-600 dark:text-violet-300" />
                          )}
                        </div>
                      </label>
                    ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right section - Guidelines */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden h-fit sticky top-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-violet-500 to-indigo-600">
              <div className="flex items-center space-x-2">
                <Info className="text-white" size={18} />
                <h2 className="text-lg font-bold text-white">Edit Event Guidelines</h2>
              </div>
            </div>

            <div className="p-4 space-y-4 text-sm">
              <div className="space-y-1">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Event Name</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Choose a clear, descriptive name that reflects the event's purpose.</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Description</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Include key details about objectives and what participants can expect.</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Date & Duration</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Specify start/end dates and expected duration (format: "X hours/days").</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Venue</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Provide specific location details including building/room numbers.</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Points & Winners</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Set maximum points based on event complexity and number of winners.</p>
              </div>

              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 flex items-center">
                  <Info size={14} className="mr-1" />
                  Important Notes
                </h3>
                <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1 pl-5 list-disc">
                  <li>All collaborating clubs will be notified of your changes</li>
                  <li>Double-check date and venue availability</li>
                  <li>Changes to points may affect participant expectations</li>
                  <li>Update club collaborations as needed before saving</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditEventPage;