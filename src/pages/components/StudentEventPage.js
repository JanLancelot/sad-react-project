import React, { useState, useEffect } from "react";
import Layout from "../Layout";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const StudentEventsPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchStudentData = async () => {
      const studentDocRef = doc(db, "users", id);
      const studentDocSnapshot = await getDoc(studentDocRef);

      if (studentDocSnapshot.exists()) {
        const studentData = studentDocSnapshot.data();
        setStudent(studentData);

        // Fetch event details
        const eventIds = studentData.eventsAttended;
        const eventDetails = await Promise.all(
          eventIds.map(async (eventId) => {
            const eventDocRef = doc(db, "meetings", eventId);
            const eventDocSnapshot = await getDoc(eventDocRef);
            return eventDocSnapshot.data();
          })
        );
        setEvents(eventDetails);
      }
    };
    fetchStudentData();
  }, [db, id]);

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="max-w-3xl w-full p-8 bg-gray-100 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-center mb-8">
            Events Attended by {student.fullName}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
              >
                <h3 className="text-2xl font-bold mb-2">{event.name}</h3>
                <p className="text-gray-600">
                  Event #{index + 1} attended by {student.fullName}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-gray-500 text-sm">
                    {/* {new Date(event.date.seconds * 1000).toLocaleString()} */}
                    {event.date}
                  </p>
                  <div className="px-4 py-2 bg-indigo-500 rounded-lg text-sm font-medium text-white hover:bg-indigo-600 transition-colors duration-300">
                    View Details
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentEventsPage;
