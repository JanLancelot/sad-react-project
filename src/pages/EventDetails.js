import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Layout from "./Layout";

const EventDetails = () => {
  const { eventId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      const eventDoc = await getDoc(doc(db, "meetings", eventId));
      if (eventDoc.exists()) {
        setEventName(eventDoc.data().name);
        const attendeePromises = eventDoc
          .data()
          .attendees.map(async (attendeeId) => {
            const attendeeDoc = await getDoc(doc(db, "users", attendeeId));
            return attendeeDoc.data();
          });
        const attendeesData = await Promise.all(attendeePromises);
        setAttendees(attendeesData);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  return (
    <Layout>
      <div className="container mx-auto my-8">
        <h1 className="text-2xl font-bold mb-4">Event: {eventName}</h1>
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
            {attendees.map((attendee, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attendee.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attendee.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attendee.department}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default EventDetails;
