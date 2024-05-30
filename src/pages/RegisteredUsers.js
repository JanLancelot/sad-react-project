import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Layout from "./Layout";

const departmentOptions = [
  { id: 0, name: "Select Department", color: "", dbl: "" },
  {
    id: 1,
    name: "Computer Studies",
    color: "bg-blue-400",
    dbl: "CS department",
  },
  {
    id: 2,
    name: "Education",
    color: "bg-green-400",
    dbl: "Education Department",
  },
  {
    id: 3,
    name: "Accountancy",
    color: "bg-yellow-400",
    dbl: "Accountancy Department",
  },
  {
    id: 4,
    name: "Business Administration",
    color: "bg-purple-400",
    dbl: "Business Administration Department",
  },
  {
    id: 5,
    name: "Arts and Sciences",
    color: "bg-pink-400",
    dbl: "Arts and Sciences Department",
  },
  { id: 6, name: "Maritime", color: "bg-teal-400", dbl: "Maritime department" },
  {
    id: 7,
    name: "Health Sciences",
    color: "bg-red-400",
    dbl: "Health Sciences Department",
  },
  {
    id: 8,
    name: "Hospitality",
    color: "bg-orange-400",
    dbl: "Hospitality Management and Tourism Department",
  },
];

const EventDetails = () => {
  const { eventId } = useParams();
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [eventName, setEventName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedUserResponse, setSelectedUserResponse] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      const eventDoc = await getDoc(doc(db, "meetings", eventId));
      if (eventDoc.exists()) {
        setEventName(eventDoc.data().name);
        const registeredUsersData = eventDoc.data().registeredUsers || [];
        const userPromises = registeredUsersData.map(async (userId) => {
          const userDoc = await getDoc(doc(db, "users", userId));
          return { ...userDoc.data(), uid: userId };
        });
        const usersData = await Promise.all(userPromises);
        setRegisteredUsers(usersData);
        setFilteredUsers(usersData);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleDepartmentChange = (e) => {
    const selectedDept = e.target.value;
    setSelectedDepartment(selectedDept);

    if (selectedDept === "") {
      setFilteredUsers(registeredUsers);
    } else {
      const filtered = registeredUsers.filter(
        (user) => user.department === selectedDept
      );
      setFilteredUsers(filtered);
    }
  };

  const handleUserClick = async (userId) => {
    const responsesQuery = query(
      collection(db, "registrationResponses"),
      where("eventId", "==", eventId),
      where("userId", "==", userId)
    );
    const responseSnapshot = await getDocs(responsesQuery);
    if (!responseSnapshot.empty) {
      const responseData = responseSnapshot.docs[0].data().responses;
      setSelectedUserResponse(responseData);
    } else {
      setSelectedUserResponse(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto my-8">
        <h1 className="text-2xl font-bold mb-4">Event: {eventName}</h1>
        <div className="mb-4">
          <label className="mr-2">Filter by Department:</label>
          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {departmentOptions.map((option) => (
              <option
                key={option.id}
                value={option.dbl}
                className={option.color}
              >
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <tr key={index} onClick={() => handleUserClick(user.uid)}>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer text-blue-600">
                  {user.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.department}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedUserResponse && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">User Response:</h2>
            {Object.entries(selectedUserResponse).map(([question, answer], index) => (
              <p key={index}><strong>{question}</strong>: {answer}</p>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventDetails;
