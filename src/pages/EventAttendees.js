import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Layout from "./Layout";
import QRCode from "react-qr-code";

function EventAttendees() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [attendeesData, setAttendeesData] = useState([]);

  useEffect(() => {
    const fetchEventData = async () => {
      const docRef = doc(db, "meetings", eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEventData(docSnap.data());
        // Fetch attendee data
        const attendeeIds = docSnap.data().attendees;
        const usersCollectionRef = collection(db, "users");
        const attendeeDocs = await Promise.all(
          attendeeIds.map((id) => getDoc(doc(usersCollectionRef, id)))
        );
        const attendees = attendeeDocs.map((doc) => doc.data().fullName);
        // Extract only fullName
        setAttendeesData(attendees);
      } else {
        // Handle error: event not found
      }
    };
    fetchEventData();
  }, [eventId]);

  if (!eventData) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{eventData.name}</h1>
        <h2 class="text-xl font-semibold text-gray-700 mb-6">Attendees</h2>

        {attendeesData.length > 0 ? (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendeesData.map((fullName, index) => (
              <div
                key={index}
                class="bg-gray-100 rounded-lg shadow-md p-4 flex items-center justify-between"
              >
                <div class="text-lg font-medium text-gray-900">{fullName}</div>
                {/* Optionally display additional attendee information here */}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No attendees yet.</p>
        )}
      </div>
      <div class="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div class="bg-gray-100 rounded-lg shadow-md p-6 border-2 border-blue-500">
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={eventId}
            viewBox={`0 0 256 256`}
          />
        </div>
      </div>
    </Layout>
  );
}

export default EventAttendees;
