import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, collection } from "firebase/firestore";
import Layout from "./Layout";
import QRCode from "react-qr-code";
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

function AttendanceChart({ attendeesData }) {
  const data = Object.values(attendeesData.reduce((acc, { department, fullName }) => {
    acc[department] = (acc[department] || 0) + 1;
    return acc;
  }, {})).map((count, index) => ({
    name: Object.keys(attendeesData.reduce((acc, { department, fullName }) => {
      acc[department] = (acc[department] || 0) + 1;
      return acc;
    }, {}))[index],
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        color="#000000"
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={120}
        fill="#8884d8"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

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
        // Only fetch attendees if the attendees array exists and is not empty
        if (docSnap.data().attendees && docSnap.data().attendees.length > 0) {
          const attendeeIds = docSnap.data().attendees;
          const usersCollectionRef = collection(db, "users");
          const attendeeDocs = await Promise.all(
            attendeeIds.map((id) => getDoc(doc(usersCollectionRef, id)))
          );
          const attendees = await Promise.all(
            attendeeDocs.map(async (doc) => ({
              fullName: doc.data().fullName,
              department: doc.data().department,
            }))
          );
          setAttendeesData(attendees);
        } else {
          // If no attendees, clear the state
          setAttendeesData([]);
        }
      } else {
        // Handle error: event not found
      }
    };
    fetchEventData();
  }, [eventId]);

  if (!eventData) {
    return <div>Loading...</div>;
  }

  const onImageCownload = () => {
    const svg = document.getElementById("QRCode");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${eventData.name}-qrcode`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{eventData.name}</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Attendees</h2>
        {attendeesData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendeesData.map(({ fullName, department }, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg shadow-md p-4 flex items-center justify-between"
              >
                <div className="text-lg font-medium text-gray-900">
                  {fullName} - {department}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No attendees yet.</p>
        )}
      </div>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="bg-gray-100 rounded-lg shadow-md p-6 border-2 border-blue-500">
          <QRCode
            size={256}
            id="QRCode"
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={eventId}
            viewBox={`0 0 256 256`}
          />
        </div>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onImageCownload}
        >
          Download QR Code
        </button>
        <AttendanceChart attendeesData={attendeesData} />
      </div>
    </Layout>
  );
}

export default EventAttendees;