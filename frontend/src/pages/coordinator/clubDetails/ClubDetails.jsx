import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { backendUrl } from "../../../utils/routes";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  UserCog, 
  Mail, 
  Star, 
  Image, 
  Edit, 
  UserCircle,
  Loader2
} from "lucide-react";

// Component imports
import AddMembers from "./components/Addmember";
import DeleteMembers from "./components/Deletemember";

// Reusable components
const Badge = ({ children, color = "bg-blue-100 text-blue-800" }) => (
  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
    {children}
  </span>
);

const Card = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-mirage-700 rounded-lg shadow p-4 transition-all hover:shadow-md">
    <div className="flex items-center gap-2 mb-3 text-mirage-700 dark:text-mirage-200">
      {icon}
      <h3 className="font-semibold">{title}</h3>
    </div>
    <div className="text-mirage-600 dark:text-mirage-300">{children}</div>
  </div>
);

const ActionButton = ({ icon, label, onClick, variant = "primary" }) => {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-mirage-600 dark:hover:bg-mirage-500 dark:text-mirage-200",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white"
  };

  return (
    <button
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${styles[variant]} text-sm font-medium`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-100">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-mirage-800 rounded-xl shadow-xl z-10 w-full max-w-[80%] max-h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-mirage-600">
          <h2 className="text-lg font-semibold text-mirage-800 dark:text-mirage-50">{title}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

function MyClub() {
  const [clubDetails, setClubDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const token = localStorage.getItem("jwtToken");
  const decodedToken = token ? jwtDecode(token) : null;
  const [memberandCoordinatorIds, setMemberAndCoordinatorIds] = useState([]);
  const [memberIds, setMemberIds] = useState([]);

  const fetchClubDetails = async () => {
    try {
      setIsLoading(true);
      if (!token || !decodedToken?.clubId) {
        console.error("No auth token or club ID found");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${backendUrl}/api/v1/club?id=${decodedToken.clubId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      if (response.ok) {
        setClubDetails(result.club);
        
        // Process member IDs
        const memberIdsArray = result.club?.members?.map(member => member._id) || [];
        setMemberIds(memberIdsArray);
        
        // Process coordinator IDs
        const coordinatorIds = [
          result.club?.coordinator1?._id,
          result.club?.coordinator2?._id
        ].filter(Boolean);
        
        setMemberAndCoordinatorIds([...memberIdsArray, ...coordinatorIds]);
      } else {
        console.error("Error fetching club details:", result.message);
      }
    } catch (error) {
      console.error("Error fetching club details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubDetails();
  }, []);

  const handleModalClose = () => {
    setActiveModal(null);
    fetchClubDetails();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-0">
        <div className="flex justify-center items-center h-12 mb-5">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
          <p className="text-mirage-600 dark:text-mirage-400">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (!clubDetails) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-mirage-800 shadow rounded-lg p-8 text-center max-w-md">
          <UserCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-mirage-800 dark:text-mirage-50">Club Details not Found</h1>
          <p className="text-mirage-600 dark:text-mirage-400 mb-6">
            No club details are available. You might not be associated with any club.
          </p>
        </div>
      </div>
    );
  }

  const { 
    name, 
    description, 
    image, 
    email, 
    overallRating, 
    coordinator1, 
    coordinator2, 
    members = [], 
    studentMembers = [] 
  } = clubDetails;

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Club Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-200 dark:to-indigo-700 rounded-xl shadow-lg mb-6 p-6 text-white">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-12 h-12 text-white/70" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-1 shadow-md hover:bg-gray-100">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{name}</h1>
                  <p className="text-blue-100 mt-1">{description || "No description available."}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
                  <ActionButton 
                    icon={<Edit className="w-4 h-4" />} 
                    label="Edit Details" 
                    onClick={() => console.log("Edit club details clicked")}
                    variant="secondary"
                  />
                  <ActionButton 
                    icon={<UserPlus className="w-4 h-4" />} 
                    label="Add Member" 
                    onClick={() => setActiveModal("addMember")}
                  />
                  <ActionButton 
                    icon={<UserMinus className="w-4 h-4" />} 
                    label="Remove Member" 
                    onClick={() => setActiveModal("deleteMember")}
                    variant="danger"
                  />
                  <ActionButton 
                    icon={<UserCog className="w-4 h-4" />} 
                    label="Add Student" 
                    onClick={() => console.log("Add student member clicked")}
                    variant="success"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 flex-wrap justify-center md:justify-start">
                <Badge color="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {email}
                  </div>
                </Badge>
                <Badge color="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Rating: {overallRating || "N/A"}
                  </div>
                </Badge>
                <Badge color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {members.length} Members
                  </div>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Club Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Coordinators Card */}
          <Card title="Coordinators" icon={<UserCog className="w-5 h-5" />}>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  <span className="font-semibold">1</span>
                </div>
                <span className="truncate">
                  {coordinator1?.email || "Not assigned"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  <span className="font-semibold">2</span>
                </div>
                <span className="truncate">
                  {coordinator2?.email || "Not assigned"}
                </span>
              </li>
            </ul>
          </Card>

          {/* Members Card */}
          <Card 
            title={`Members (${members.length})`} 
            icon={<Users className="w-5 h-5" />}
          >
            {members.length > 0 ? (
              <div className="max-h-48 overflow-y-auto pr-2">
                <ul className="space-y-1">
                  {members.map((member) => (
                    <li key={member._id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-mirage-600">
                      <UserCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="truncate text-sm">{member.email}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">No members yet</p>
            )}
          </Card>

          {/* Student Members Card */}
          <Card 
            title={`Student Members (${studentMembers.length})`} 
            icon={<UserPlus className="w-5 h-5" />}
          >
            {studentMembers.length > 0 ? (
              <div className="max-h-48 overflow-y-auto pr-2">
                <ul className="space-y-1">
                  {studentMembers.map((student) => (
                    <li key={student} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-mirage-600">
                      <UserCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="truncate text-sm">{student}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">No student members yet</p>
            )}
          </Card>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={activeModal === "addMember"}
        onClose={handleModalClose}
        title="Add New Member"
      >
        <AddMembers
          alreadyMemberIds={memberandCoordinatorIds}
          onClose={handleModalClose}
        />
      </Modal>

      {/* Delete Member Modal */}
      <Modal
        isOpen={activeModal === "deleteMember"}
        onClose={handleModalClose}
        title="Remove Member"
      >
        <DeleteMembers
          members={members}
          onClose={handleModalClose}
        />
      </Modal>
    </div>
  );
}

export default MyClub;