import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, collection } from "firebase/firestore";
import Layout from "./Layout";
import QRCode from "react-qr-code";
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
import { FaFilter } from "react-icons/fa";

function AttendanceChart({ attendeesData }) {
  const data = Object.values(
    attendeesData.reduce((acc, { department, fullName }) => {
      acc[department] = (acc[department] || 0) + 1;
      return acc;
    }, {})
  ).map((count, index) => ({
    name: Object.keys(
      attendeesData.reduce((acc, { department, fullName }) => {
        acc[department] = (acc[department] || 0) + 1;
        return acc;
      }, {})
    )[index],
    value: count,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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
  const [filteredAttendeesData, setFilteredAttendeesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  useEffect(() => {
    const fetchEventData = async () => {
      const docRef = doc(db, "meetings", eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEventData(docSnap.data());
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
          setFilteredAttendeesData(attendees);
        } else {
          setAttendeesData([]);
          setFilteredAttendeesData([]);
        }
      } else {
      }
    };
    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const filteredData =
      selectedDepartment === "All"
        ? attendeesData
        : attendeesData.filter(
            (attendee) => attendee.department === selectedDepartment
          );
    setFilteredAttendeesData(
      filteredData.slice(indexOfFirstItem, indexOfLastItem)
    );
  }, [currentPage, itemsPerPage, attendeesData, selectedDepartment]);

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDepartmentFilter = (department) => {
    setSelectedDepartment(department);
    setCurrentPage(1);
  };

  if (!eventData) {
    return <div>Loading...</div>;
  }

  const departments = [
    "All",
    ...new Set(attendeesData.map((attendee) => attendee.department)),
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {eventData.name}
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Attendees</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-500" />
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedDepartment}
              onChange={(e) => handleDepartmentFilter(e.target.value)}
              style={{
                paddingRight: "30px",
              }}
            >
              {departments.map((department, index) => (
                <option key={index} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="itemsPerPage" className="mr-2">
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              style={{
                width: "100px",
                paddingRight: "20px",
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>50</option>
            </select>
          </div>
        </div>
        {filteredAttendeesData.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-medium">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Department</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendeesData.map(
                  ({ fullName, department }, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-3">{fullName}</td>
                      <td className="px-4 py-3">{department}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
            <div className="flex justify-center mt-6">
              <nav>
                <ul className="inline-flex -space-x-px">
                  {Array.from(
                    { length: Math.ceil(attendeesData.length / itemsPerPage) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <li key={page}>
                      <button
                        className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                          currentPage === page ? "bg-blue-500 text-white" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No attendees yet.</p>
        )}
      </div>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500">
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
