import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { backendUrl } from "../../../../utils/routes";
import axios from "axios";

function AddStudent({ eventId }) {
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [alreadyParticipants, setAlreadyParticipants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7); // Increased to 10 students per page
    
    const token = localStorage.getItem("jwtToken");

    useEffect(() => {
        const fetchAlreadyParticipants = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/api/v1/club/attendance`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        eventId: eventId
                    }
                });
                
                if (response.data && !response.data.isError) {
                    setAlreadyParticipants(response.data.records);
                }
            } catch (error) {
                console.error("Error fetching already participants:", error);
                setError("Failed to fetch already participants");
            } finally {
                setIsLoading(false);
            }
        };
        console.log("Fetching already participants for event:", alreadyParticipants);
        const fetchAllStudents = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.data && !response.data.isError) {
                    const students = response.data.records.filter(student => student.role === "student");
                    setAllStudents(students);
                }
            } catch (error) {
                console.error("Error fetching students:", error);
                setError("Failed to fetch students");
            } finally {
                setIsLoading(false);
            }
        };

        //from allStudents filer out alreadyParticipants and store in filteredStudents
        const filterStudents = () => {
            const filtered = allStudents.filter(student => 
                !alreadyParticipants.some(participant => participant.userId === student._id)
            );
            setFilteredStudents(filtered);
        };  


        fetchAlreadyParticipants();
        fetchAllStudents();
        filterStudents();
    }, [eventId, token, alreadyParticipants, allStudents]);
}
