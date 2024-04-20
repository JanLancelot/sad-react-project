import React, { useState, useEffect } from "react";
import Layout from "../Layout";
import LoadingSpinner from './LoadingSpinner';
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  getFirestore,
  updateDoc,
  arrayRemove,
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

        // Fetch event details and remove non-existent eventIds
        const eventIds = studentData.eventsAttended || [];
        const eventDetails = [];
        const nonExistentEventIds = [];

        const eventPromises = eventIds.map(async (eventId) => {
          const eventDocRef = doc(db, "meetings", eventId);
          const eventDocSnapshot = await getDoc(eventDocRef);
          if (eventDocSnapshot.exists()) {
            eventDetails.push(eventDocSnapshot.data());
          } else {
            nonExistentEventIds.push(eventId);
          }
        });

        await Promise.all(eventPromises);

        // Remove non-existent eventIds from the eventAttendees array
        if (nonExistentEventIds.length > 0) {
          const userRef = doc(db, "users", id);
          await updateDoc(userRef, {
            eventsAttended: arrayRemove(...nonExistentEventIds),
          });
        }

        setEvents(eventDetails);
      }
    };
    fetchStudentData();
  }, [db, id]);

  if (!student) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            Events Attended by {student.fullName}
          </h1>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-3 px-4 text-left">Event Name</th>
                  <th className="py-3 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-300"
                  >
                    <td className="py-4 px-4 text-gray-800">{event.name}</td>
                    <td className="py-4 px-4 text-gray-600">{event.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentEventsPage;
